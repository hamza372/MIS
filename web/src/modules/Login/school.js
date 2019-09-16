import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, Redirect } from 'react-router-dom'
import { createSchoolLogin } from 'actions'
import Former from 'utils/former'
import Layout from 'components/Layout'

class SchoolLogin extends Component {

	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			school: "",
			password: "",
			errorMessage: ""
		}

		this.former = new Former(this, [])
	}

	onLogin = () => {
		console.log(this.state)
		this.props.login(this.state.school, this.state.password);
	}

	componentWillReceiveProps(newProps) {

		if(newProps.auth.attempt_failed) {
			this.setState({
				errorMessage: "Login failed"
			})
		}

		if(newProps.auth.token !== undefined && newProps.auth.token !== this.props.auth.token) {
			this.props.history.push('/login')
		}
	}

	removeErrorMessage = () => {
		setTimeout(() => {
			this.setState({
				errorMessage: ""
			})
		}, 3000)
	}

	render() {

		if(this.props.auth.faculty_id)
		{
			return <Redirect to="/landing" />
		}

		if (!this.props.connected) {
			return <div>Connecting.....</div>
		}

		return <Layout history={this.props.history}>
			<div className="school-login">
				<div className="title">Verify your School</div>
				<div className="form">
					<div className="row">
						<label>School ID</label>
						<input type="text" {...this.former.super_handle(["school"])} placeholder="School ID" autoCorrect="off" autoCapitalize="off" />
					</div>
					<div className="row">
						<label>Password</label>
						<input type="password" {...this.former.super_handle(["password"])} placeholder="Password" />
					</div>
					<div className="button save" onClick={this.onLogin}>Login</div>
				</div>
				{ this.props.auth.loading ? <div>Signing in....</div> : false }
				{ this.props.auth.attempt_failed ? <div>{ this.state.errorMessage }</div> : false }
				{ this.state.errorMessage !== "" ? this.removeErrorMessage() : false }
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