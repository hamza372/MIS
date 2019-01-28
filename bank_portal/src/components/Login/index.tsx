import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createLogin } from '~/src/actions'

import former from '~/src/utils/former'
import { checkPropTypes } from 'prop-types';

interface propTypes {
	connected: boolean,
	login: (id : string, password : string) => void
	auth: RootBankState['auth'],
}

interface state {
	username: string,
	password: string
}

class Login extends Component<propTypes, state>{

	private former: former

	constructor(props : any) {
		super(props);

		this.state = {
			username: "",
			password: ""
		}

		this.former = new former(this, [])
	}

	login = () => {
		this.props.login(this.state.username, this.state.password)
	}

	render() {

		if(!this.props.connected) {
			return <div>Connecting...</div>
		}

		return <div className="page">

			<div className="title">Login</div>
			<div className="form" style={{ margin: "auto", width: "90%", display: "flex", flexDirection: "column", alignContent: "center"}}>
				<div className="row">
					<label>Username</label>
					<input type="text" {...this.former.super_handle(["username"])} placeholder="username" />
				</div>
				<div className="row">
					<label>Password</label>
					<input type="password" {...this.former.super_handle(["password"])} placeholder="password" />
				</div>
				<div className="button blue" onClick={this.login}>Login</div>
			</div>
		</div>


	}
}

export default connect((state : RootBankState) => ({
	connected: state.connected,
	auth: state.auth
}), (dispatch : any) => ({
	login: (id : string, password : string) => dispatch(createLogin(id, password))
}))(Login)