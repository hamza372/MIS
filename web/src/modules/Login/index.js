import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, Redirect } from 'react-router-dom'
import { createLogin } from 'actions'

import Former from 'utils/former'
import Layout from 'components/Layout'


// login is a different kind of action.
// first time they do it, no schools are syncd.
// second time we'll have some stuff...
class Login extends Component {

	constructor(props) {
		super(props);
		this.state = {
			login: {
				school: "",
				username: "",
				password: ""
			}
		}

		this.former = new Former(this, ["login"]);
	}

	onLogin = () => {
		this.props.login(this.state.login)
	}

	componentWillReceiveProps(newProps) {
		if(newProps.auth.username !== undefined && newProps.auth.username !== this.props.auth.username) {
			this.props.history.push('/')
		}
	}

	render() {

		if(this.props.num_users === 0) {
			return <Redirect to="/faculty/first" />
		}

		return <Layout>
			<div className="login">
				<div className="title">{`Login to School ${this.props.auth.school_id}`}</div>
				<input type="text" {...this.former.super_handle(["username"])} placeholder="Username" />
				<input type="password" {...this.former.super_handle(["password"])} placeholder="Password" />
				<div className="button save" onClick={this.onLogin}>Login</div>
				{ this.props.auth.attempt_failed ? <div>Login Attempt Failed.</div> : false }
			</div>
		</Layout>

	}
}

export default connect(state => ({ 
	auth: state.auth,
	num_users: Object.keys(state.db.users).length
}), dispatch => ({
	login: (login) => {
		dispatch(createLogin(login.username, login.password))
	}
}))(withRouter(Login));