import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, Redirect } from 'react-router-dom'
import { createLogin } from 'actions'

import Former from 'utils/former'
import Layout from 'components/Layout'

import './style.css'

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

	onSwitchSchool = () => {

		if(this.props.unsyncd_changes > 0) {
			const res = window.confirm(`You have ${this.props.unsyncd_changes} pending changes. If you switch schools, this data will be lost. Are you sure you want to continue?`);
			if(!res) {
				return;
			}
		}

		localStorage.removeItem("db");
		this.props.history.push("/landing")
		window.location.reload()
	}

	componentWillReceiveProps(newProps) {
		if(newProps.auth.name !== undefined && newProps.auth.name !== this.props.auth.name) {
			this.props.history.push('/landing')
		}
	}

	render() {

		if(!this.props.auth.token) {
			return <Redirect to="/school-login" />
		}

		if(this.props.num_users === 0) {
			return <Redirect to="/faculty/first" />
		}

		return <Layout history={this.props.history}>
			<div className="login">
				<div className="title">{`Login to School ${this.props.auth.school_id}`}</div>
				<div className="form">
					<div className="row">
						<label>Teacher Name</label>
						<select {...this.former.super_handle(["name"])}>
							<option value="" disabled>Select a User</option>
						{
							Object.entries(this.props.users).map(([uid, u]) => <option key={uid} value={u.name}>{u.name}</option>)
						}
						</select>
					</div>
					<div className="row">
						<label>Password</label>
						<input type="text" {...this.former.super_handle(["password"])} placeholder="Password" autoCapitalize="off"/>
					</div>
					<div className="button save" onClick={this.onLogin}>Login</div>
				</div>
				{ this.props.auth.attempt_failed ? <div>Login Attempt Failed.</div> : false }
				{ this.props.connected ? <div className="button red" onClick={this.onSwitchSchool} style={{ position: "absolute", bottom: "20px", left: "20px" }}>Switch School</div> : false }
			</div>
		</Layout>

	}
}

export default connect(state => ({ 
	auth: state.auth,
	users: state.db.users,
	num_users: Object.keys(state.db.users).length,
	connected: state.connected,
	unsyncd_changes: Object.keys(state.queued).length
}), dispatch => ({
	login: (login) => {
		dispatch(createLogin(login.name, login.password))
	}
}))(withRouter(Login));