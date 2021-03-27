// the server keeps porcessed indexes in a postgress table (not the values);
// and it will keep key/value pairs of processed indexes in a redis instance
const keys = require('./keys');

// Express setup
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgress client setup
const { Pool } = require('pg');
const pgClient = new Pool({
	user: keys.pgUser,
	host: keys.pgHost,
	database: keys.pgDatabase,
	password: keys.pgPassword,
	port: keys.pgPort,
});
pgClient.on('error', () => console.log('lost PG connection'));

// we need to create a pg table to store the processed indexes in.
// If a table named "values" does not already exist, we create one.
// It has a single column named "number" of type INT

// pgClient.on('connect', () => {
pgClient
	.query('CREATE TABLE IF NOT EXISTS values (number INT)')
	// If anything goes wrong while creating the table, we log it.
	.catch((err) => console.log(err));
// });

// Redis client setup
const redis = require('redis');
const redisClient = redis.createClient({
	host: keys.redisHost,
	port: keys.redisPort,
	retry_strategy: () => 1000,
});
// We need to duplicate the redis clients, because it can do one thing at a time
// e.g.
// connect to redis server
// listening on the redis server[?]
// subscribe to information on redis
// publishing information to redis
const redisPublisher = redisClient.duplicate();

// express route handles

app.get('/api/', (req, res) => {
	res.send('hi');
});

app.get('/values/all', async (req, res) => {
	// grabs everything from the "values" table,
	// i.t.c. just data under the "number" column, which are our processed indexes.
	const values = await pgClient.query('SELECT * from values');

	// values.rows has the actual data, the rest is metadata about
	// how long the query took, what tables we touched, etc.
	res.send(values.rows);
});

app.get('/values/current', (req, res) => {
	// We have a hash called "values" inside the redis instance.
	// We will grab everything(key/values?) from there and send back.
	// redis for nodejs doesn't support promises, so we have to use error first callback here
	redisClient.hgetall('values', (err, values) => {
		res.send(values);
	});
});

app.post('/values', (req, res) => {
	const index = req.body.index;

	// high indexes are very expensive to calculate with our recursive algorithm, so we cap it at 40.
	if (parseInt(index) > 40) {
		// 422 means unable to process the contained entity/instructions, even though
		// req syntax was correct => 400 (aka bad req) won't work and
		// req entity content type is understood => 415 (aka unsupported media type) won't work
		res.status(422).send('Index too high!');
		return;
	}

	// set placeholder in the redis instance hash untill the worker finishes the tasks.
	redisClient.hset('values', index, 'Nothing yet!');
	// this will trigger the worker that's listening for the insert message/event
	redisPublisher.publish('insert', index);
	// $1, I'm assuming, referts to the first elem in the array passed as the 2nd param.
	// so this will insert a new row into the values table,
	// and will use the index as number column's value
	pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

	// senging back some arbitrary data to indicate we are working on calculating
	// and setting the fib values
	res.send({ working: true });
});

app.listen(5000, (err) => {
	console.log('Listening on part 5000');
});
