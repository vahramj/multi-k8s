const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
	host: keys.redisHost,
	port: keys.redisPort,
	// retry_strategy tells our redis client that if it looses connection w the server
	// it has to try reconnect every 1000ms
	retry_strategy: () => 1000,
});

// sub stands for subscription
const sub = redisClient.duplicate();

function fib(index) {
	if (index < 2) {
		return 1;
	}
	return fib(index - 1) + fib(index - 2);
}
// [does this get triggered any time anything is published to the redis instance's connection?
// or does it react to only .subscribe(below) on this particular client duplicate?]
sub.on('message', (channel, message) => {
	// message will be our fib index
	// in the hash named values inside redis, use message/index as the key and fib value of it as value
	const calculatedFib = fib(parseInt(message));
	// console.log('****\n****\n*****\n***: ', calculatedFib);
	redisClient.hset('values', message, calculatedFib);
});
// the server has an instance of this redis[(same port and host)?], and publishes insert events to it
// (see "../server/index.js")

sub.subscribe('insert');
