import React, { Component } from 'react';
import axios from 'axios';

export default class Fib extends Component {
	state = {
		seenIndexes: [],
		values: {},
		index: '',
	};

	componentDidMount() {
		this.fetchValues();
		this.fetchIndexes();
	}

	async fetchValues() {
		const values = await axios.get('/api/values/current');
		this.setState({ values: values.data });
	}

	async fetchIndexes() {
		const seenIndexes = await axios.get('/api/values/all');
		this.setState({
			seenIndexes: seenIndexes.data,
		});
	}

	renderSeenIndexes() {
		const { seenIndexes } = this.state;
		const seenIndexesStr = seenIndexes.map(({ number }) => number).join(', ');
		return seenIndexesStr;
	}

	renderCalculatedValues() {
		const { values } = this.state;

		const renderedValues = Object.keys(values).map(key => {
			return (
				<div key={key}>
					For index {key} I calculated {values[key]}
				</div>
			);
		});

		return renderedValues;
	}

	handleIndexInputChange = event => {
		this.setState({ index: event.target.value });
	};

	handleSubmit = async event => {
		event.preventDefault();

		try {
			await axios.post('/api/values', { index: this.state.index });
			this.setState({ index: '' });
		} catch (err) {
			console.log(err);
		}
	};

	render() {
		return (
			<div>
				<form action="" onSubmit={this.handleSubmit}>
					<label htmlFor="">Enter your index</label>
					<input
						type="text"
						value={this.state.index}
						onChange={this.handleIndexInputChange}
					/>
					<button>submit</button>
				</form>

				<h3>Indexes I have seen: </h3>
				{this.renderSeenIndexes()}

				<h3>Calculated values: </h3>
				{this.renderCalculatedValues()}
			</div>
		);
	}
}
