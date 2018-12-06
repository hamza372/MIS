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
				name: "",
				password: ""
			}
		}

		this.former = new Former(this, ["login"]);
	}

	onLogin = () => {
		this.props.login(this.state.login)
	}

	componentWillReceiveProps(newProps) {
		if(newProps.auth.name !== undefined && newProps.auth.name !== this.props.auth.name) {
			this.props.history.push('/')
		}
	}

	render() {

		const num_users = Object.keys(this.props.users).length;

		if(num_users === 0) {
			return <Redirect to="/faculty/first" />
		}

		return <Layout>
			<div className="login">
				<div className="title">{`Login to School ${this.props.auth.school_id}`}</div>
				<div className="form">
					<div className="row">
						<label>Teacher Name</label>
						<select {...this.former.super_handle(["name"])}>
							<option key="blah" value="" disabled>Select User</option>
							{
								Object.entries(this.props.users)
									.map(([uid, u]) => <option key={uid} value={u.name}>{u.name}</option>)
							}
						</select>
					</div>
					<div className="row">
						<label>Password</label>
						<input type="password" {...this.former.super_handle(["password"])} placeholder="Password" />
					</div>
					<div className="button save" onClick={this.onLogin}>Login</div>
				</div>
				{ this.props.auth.attempt_failed ? <div>Login Attempt Failed.</div> : false }
			</div>
		</Layout>

	}
}

export default connect(state => ({ 
	auth: state.auth,
	users: state.db.users,
	num_users: Object.keys(state.db.users).length
}), dispatch => ({
	login: (login) => {
		dispatch(createLogin(login.name, login.password))
	}
}))(withRouter(Login));