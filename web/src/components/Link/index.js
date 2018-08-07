import React, { Component } from 'react'
import { Link } from 'react-router-dom'

export default class LinkButton extends Component {

	constructor(props) {
		super(props);
		this.state = { engaged: false }
	}
	
	onTouchStart = () => this.setState({ engaged: true })
	onTouchEnd = () => this.setState({ engaged: false })

	render() {
		const {to, children} = this.props;
		return <Link 
			to={to} 
			className={`link-button ${this.state.engaged ? "engaged" : ""}`}
			onTouchStart={this.onTouchStart}
			onTouchEnd={this.onTouchEnd}>{children}
			</Link>
	}
}