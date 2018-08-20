import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createLogin } from 'actions'

import Former from 'utils/former'
import Layout from 'components/Layout'


// login is a different kind of action.
// first time they do it, no schools are syncd.
// second time we'll have some stuff...
// password needs to be hashed immediately on teacher creation
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
		console.log('dispatching')
		this.props.login(this.state.login)
	}

	render() {
		return <Layout>
			<div className="login">
				<input type="text" {...this.former.super_handle(["school"])} placeholder="School ID" />
				<input type="text" {...this.former.super_handle(["username"])} placeholder="Username" />
				<input type="password" {...this.former.super_handle(["password"])} placeholder="Password" />
				<div className="button save" onClick={this.onLogin}>Login</div>
			</div>
		</Layout>

	}
}

export default connect(state => state, dispatch => ({
	login: (login) => {
		dispatch(createLogin(login.school, login.username, login.password))
	}
}))(Login);