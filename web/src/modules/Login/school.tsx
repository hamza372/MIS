import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, Redirect } from 'react-router-dom'
import { createSchoolLogin } from 'actions'
import { RouteComponentProps } from 'react-router'
import Former from 'utils/former'
import Layout from 'components/Layout'
import { EyeOpenIcon, EyeClosedIcon, DownloadIcon } from 'assets/icons'


type PropsType = {
	login: (school_id: string, password: string) => void
} & RootReducerState & RouteComponentProps

type S = {
	loading: boolean
	school: string
	password: string
	errorMessage: string
	showPassword: boolean
}

class SchoolLogin extends Component<PropsType, S> {

	former: Former
	constructor(props: PropsType) {
		super(props)

		this.state = {
			loading: false,
			school: "",
			password: "",
			errorMessage: "",
			showPassword: false
		}

		this.former = new Former(this, [])
	}

	getPasswordInputType = () => this.state.showPassword ? "text" : "password"
	getShowHideIcon = () => this.state.showPassword ? EyeOpenIcon : EyeClosedIcon

	onLogin = () => {
		this.props.login(this.state.school, this.state.password);
	}

	handleKeyDown = (e: React.KeyboardEvent) => {
		// check 'enter' key pressed
		if (e.keyCode === 13) {
			this.onLogin()
		}
	}

	componentWillReceiveProps(newProps: PropsType) {

		if (newProps.auth.attempt_failed) {
			this.setState({
				errorMessage: "Login failed"
			})
		}

		if (newProps.auth.token !== undefined && newProps.auth.token !== this.props.auth.token) {
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

		if (this.props.auth.faculty_id) {
			return <Redirect to="/landing" />
		}

		if (!this.props.connected) {
			return <div>Connecting.....</div>
		}

		if (!this.props.initialized) {
			return <div className="downloading">
				<img className="bounce" src={DownloadIcon} alt="download-icon" />
				<div style={{ marginTop: "10px" }}>Downloading Database, Please wait...</div>
			</div>
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
						<div style={{ display: "flex" }}>
							<input
								type={`${this.getPasswordInputType()}`}
								{...this.former.super_handle(["password"])}
								onKeyDown={this.handleKeyDown}
								placeholder="Password"
								style={{ borderRadius: "5px 0px 0px 5px" }}
							/>
							<div className="show-hide-container">
								<img
									src={this.getShowHideIcon()}
									onClick={() => this.setState({ showPassword: !this.state.showPassword })}
									alt="eye-icon" />
							</div>
						</div>
					</div>
					<div className="button save" onClick={this.onLogin}>Login</div>
				</div>
				{this.props.auth.loading ? <div>Signing in....</div> : false}
				{this.props.auth.attempt_failed ? <div>{this.state.errorMessage}</div> : false}
				{this.state.errorMessage !== "" ? this.removeErrorMessage() : false}
			</div>
		</Layout>
	}
}

export default connect((state: RootReducerState) => ({
	connected: state.connected,
	auth: state.auth,
	initialized: state.initialized
}), (dispatch: Function) => ({
	login: (school_id: string, password: string) => dispatch(createSchoolLogin(school_id, password))
}))(withRouter(SchoolLogin))