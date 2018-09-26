import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { createSchoolLogin } from 'actions'
import Former from 'utils/former'
import Layout from 'components/Layout'

class SchoolLogin extends Component {

	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			school: "",
			password: ""
		}

		this.former = new Former(this, [])
	}

	onLogin = () => {
		console.log(this.state)
		this.props.login(this.state.school, this.state.password);
	}

	componentWillReceiveProps(newProps) {
		if(newProps.auth.token !== undefined && newProps.auth.token !== this.props.auth.token) {
			this.props.history.push('/login')
		}
	}

	render() {

		if (!this.props.connected) {
			return <div>This page requires an internet connection. Attempting to connect.....</div>
		}

		return <Layout>
			<div className="school-login">
				<div className="title">Verify your School</div>
				<div className="form">
					<div className="row">
						<label>School ID</label>
						<input type="text" {...this.former.super_handle(["school"])} placeholder="School ID" />
					</div>
					<div className="row">
						<label>Password</label>
						<input type="password" {...this.former.super_handle(["password"])} placeholder="Password" />
					</div>
					<div className="button save" onClick={this.onLogin}>Login</div>
				</div>
				{ this.props.auth.loading ? <div>Signing in....</div> : false }
				{ this.props.auth.attempt_failed ? <div>Login failed</div> : false }
			</div>
		</Layout>
	}
}

export default connect(state => ({
	connected: state.connected,
	auth: state.auth
}), dispatch => ({
	login: (school_id, password) => dispatch(createSchoolLogin(school_id, password))
}))(withRouter(SchoolLogin))