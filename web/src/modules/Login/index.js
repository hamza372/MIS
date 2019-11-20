import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, Redirect } from 'react-router-dom'
import { createLogin } from 'actions'

import Former from 'utils/former'
import Layout from 'components/Layout'
import eyeOpen from './icons/eye_open.svg'
import eyeClosed from './icons/eye_closed.svg'

import './style.css'
import { openDB } from 'idb'

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
			},
			showPassword: false
		}

		this.former = new Former(this, ["login"]);
	}

	getPasswordInputType = () => this.state.showPassword ? "text" : "password"
	getShowHideIcon = () => this.state.showPassword ? eyeOpen : eyeClosed

	onLogin = () => {
		this.props.login(this.state.login)
	}

	handleKeyDown = (e) => {
		// check 'enter' key pressed
		if(e.keyCode === 13) {
			this.onLogin()
		}
	}

	onSwitchSchool = () => {

		if(this.props.unsyncd_changes > 0) {
			const res = window.confirm(`You have ${this.props.unsyncd_changes} pending changes. Please Export Db to file before Switching School. If you switch schools without exporting, this data will be lost. Are you sure you want to continue?`);
			if(!res) {
				return;
			}
		}

		openDB('db', 1, {
			upgrade(db) {
				db.createObjectStore('root-state')
			}
		}).then(db => {
			db.get('root-state', "db")
				.then(res => {
					try {
						console.log("BACKING UP TO IDB")
						if (localStorage.getItem('backup')) {
							localStorage.removeItem('backup')
						}
						db.put('root-state',res,'backup')
					}
					catch {
						console.log("Backup to LocalStorage Failed (on SwitchSchool)")
						if (this.props.unsyncd_changes > 0) {
							try {
								console.log("Backing up unsynced to IDB")
								const state = JSON.parse(res)
								db.put('root-state', JSON.stringify(state.queued), "backup-queued")
							}
							catch {
								console.log("Backup of unsynced to IDB failed")
							}
						}
					}
				})

			db.delete('root-state', 'db')
				.then(res => {
					
					if (localStorage.getItem('db')){
						localStorage.removeItem("db")
					}
					this.props.history.push("/landing")
					window.location.reload()
				})
				.catch(err => console.error(err))
		})
		.catch(err => console.error(err))

		// localStorage.removeItem("db");
		// this.props.history.push("/landing")
		// window.location.reload()
	}

	componentWillReceiveProps(newProps) {
		if(newProps.auth.name !== undefined && newProps.auth.name !== this.props.auth.name) {
			this.props.history.push('/landing')
		}
	}

	render() {
		
		if (!this.props.initialized && this.props.auth.token !== undefined ) {
			return <div>Loading Database...</div>
		}
		
		if(!this.props.auth.token) {
			return <Redirect to="/school-login" />
		}

		if(this.props.auth.faculty_id)
		{
			return <Redirect to="/landing" />
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
						<div style={{ display:"flex" }}>
							<input
								type={`${this.getPasswordInputType()}`}
								{...this.former.super_handle(["password"])}
								placeholder="Password" autoCapitalize="off"
								onKeyDown={this.handleKeyDown}
								style={{ borderRadius:"5px 0px 0px 5px"}}
							/>
							<div className="show-hide-container">
								<img
									src={this.getShowHideIcon()}
									onClick={() => this.setState({ showPassword: !this.state.showPassword })} 
									alt="eye-icon"/>

							</div>
						</div>
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
	initialized: state.initialized,
	users: state.db.users,
	num_users: Object.keys(state.db.users).length,
	connected: state.connected,
	unsyncd_changes: Object.keys(state.queued).length
}), dispatch => ({
	login: (login) => {
		dispatch(createLogin(login.name, login.password))
	}
}))(withRouter(Login));