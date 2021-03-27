import React from 'react';
import logo from './logo.svg';
import { BrowserRouter, Link, Route } from 'react-router-dom';
import Fib from './Fib';
import OtherPages from './OtherPage';
import './App.css';

function App() {
	return (
		<BrowserRouter>
			<div className="App">
				<h1 className="title">Fib Calculator version 2</h1>
				<header className="App-header">
					<Link to="/">Home</Link>
					<Link to="/otherpages">OtherPages</Link>
				</header>
				<div>
					<Route exact path="/" component={Fib} />
					<Route path="/otherpages" component={OtherPages} />
				</div>
			</div>
		</BrowserRouter>
	);
}

export default App;
