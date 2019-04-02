import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { createLogin } from '~/src/actions'

import locations from '~/src/utils/narrowed.json'

import former from '~/src/utils/former'
//import DeckMap from '~/src/components/DeckMap'

import './style.css'

interface propTypes {
	connected: boolean,
	login: (id : string, password : string, number : string) => void
	auth: RootBankState['auth'],
}

interface state {
	username: string
	password: string
	number: string
}

class Login extends Component<propTypes & RouteComponentProps, state>{

	private former: former

	constructor(props : any) {
		super(props);

		this.state = {
			username: "",
			password: "",
			number: ""
		}

		this.former = new former(this, [])
	}

	login = () => {
		this.props.login(this.state.username, this.state.password, this.state.number)
	}

	componentWillReceiveProps(nextProps : propTypes) {

		console.log(nextProps)
		console.log("NEXT PROPS")
		if(nextProps.auth.token && nextProps.auth.token !== this.props.auth.token) {
			this.props.history.push('/');
		}
	}

	render() {

		if(!this.props.connected) {
			return <div>Connecting...</div>
		}

		return <div className="login page">

			<div className="cover" style={{ }}>
				<div className="title" style={{ fontSize: "3rem" }}>Welcome to IlmExchange</div>
				<div className="divider"></div>
				<div className="form">
					<div className="row">
						<input type="text" {...this.former.super_handle(["username"])} placeholder="username" />
					</div>
					<div className="row">
						<input type="password" {...this.former.super_handle(["password"])} placeholder="password" />
					</div>
					<div className="row">
						<input type="tel" {...this.former.super_handle(["number"])} placeholder="Your Cellphone Number" />
					</div>
					<div className="button blue" onClick={this.login}>Login</div>
				</div>
			</div>
		</div>
	}
}

/*
*/

export default connect((state : RootBankState) => ({
	connected: state.connected,
	auth: state.auth
}), (dispatch : any) => ({
	login: (username : string, password : string, number : string) => dispatch(createLogin(username, password, number))
}))(withRouter(Login))