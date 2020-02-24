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
	loginButtonPressed: boolean
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
			showPassword: false,
			loginButtonPressed: false
		}

		this.former = new Former(this, [])
	}

	getPasswordInputType = () => this.state.showPassword ? "text" : "password"
	getShowHideIcon = () => this.state.showPassword ? EyeOpenIcon : EyeClosedIcon

	onLogin = () => {

		const { school, password } = this.state

		if (school === "" || password === "") {
			alert("Please enter School ID or password")
			return
		}

		this.setState({ loginButtonPressed: true }, () => {
			this.props.login(this.state.school, this.state.password);
		})
	}

	handleKeyDown = (e: React.KeyboardEvent) => {
		// check 'enter' key pressed
		if (e.keyCode === 13) {
			this.onLogin()
		}
	}

	UNSAFE_componentWillReceiveProps(nextProps: PropsType) {

		if (nextProps.auth.attempt_failed && this.state.loginButtonPressed && !nextProps.auth.loading) {
			this.setState({
				password: "",
				loginButtonPressed: false,
				errorMessage: "School ID or Password is incorrect!"
			}, () => {
				setTimeout(() => {
					this.setState({
						errorMessage: "",
					})
				}, 3000)
			})
		}

		if (nextProps.auth.token !== undefined && nextProps.auth.token !== this.props.auth.token) {
			this.props.history.push('/login')
		}
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
			<div className="login school-login">
				<div className="title">Verify your School</div>
				<div className="form">
					<div className="row">
						<input type="text" {...this.former.super_handle(["school"])} placeholder="School ID" autoCorrect="off" autoCapitalize="off" />
					</div>
					<div className="row">
						<div style={{ display: "flex" }}>
							<input
								type={`${this.getPasswordInputType()}`}
								{...this.former.super_handle(["password"])}
								onKeyDown={this.handleKeyDown}
								placeholder="Password"
								style={{ borderRadius: "5px 0px 0px 5px", width: "90%" }}
							/>
							<div className="show-hide-container">
								<img
									src={this.getShowHideIcon()}
									onClick={() => this.setState({ showPassword: !this.state.showPassword })}
									alt="eye-icon" />
							</div>
						</div>
					</div>
					<div className="button blue" onClick={this.onLogin}>Login</div>
					{this.props.auth.loading ? <div>Logging in...</div> : false}
					<div className="error">{this.state.errorMessage}</div>

				</div>
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