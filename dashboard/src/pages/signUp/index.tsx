import React, { Component } from 'react'
import { createSchoolLogin } from '../../actions/index'
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import Former from 'former';
import checkCompulsoryFields from '../../utils/checkCompulsoryFields';

import './style.css'

interface P {
	createSchoolLogin: (username: string, password: string, limit: number, package_name: string, agent_name: string, agent_type: string, agent_city: string, notes: string) => any
}

interface S {
	login_info: {
		username: string,
		password: string,
		package_name: "FREE_TRIAL" | "TALEEM1" | "TALEEM2" | "TALEEM3",
		agent_name: string,
		agent_type: string,
		agent_city: string,
		notes: string
	}
}

interface Routeinfo {
	id: string
}

type propTypes = RouteComponentProps<Routeinfo> & P

class SignUp extends Component <propTypes, S> {
	
	former: Former
	constructor(props: propTypes) {
		super(props)
	
		this.state = {
			login_info: {
				username: "",
				password: "",
				package_name: "FREE_TRIAL",
				agent_name: "",
				agent_type: "",
				agent_city: "",
				notes: ""
			}
		}

		this.former = new Former(this,["login_info"])
	}

	getLimitFromPackage = (package_name: string) => {
		switch (package_name) {
			case "TALEEM1":
				return 150
			case "TALEEM2":
				return 300
			default:
				return 0
		}
	}
	onSignUp = () => {
		const { username, password, package_name, agent_name, agent_type, agent_city, notes} = this.state.login_info

		const compulsory_fields = checkCompulsoryFields(this.state.login_info,
			[
				["username"],
				["password"],
				["package_name"],
				["agent_name"],
				["agent_type"],
				["agent_city"]
			]
		)

		if(compulsory_fields) {
			const erroText = `Please Fill ${(compulsory_fields as string[][]).map(x => x[0] === "agent_name" ? "Agent Name" : x[0]).join(", ")} !`
			return window.alert(erroText)
		}

		const limit = this.getLimitFromPackage(package_name)

		this.props.createSchoolLogin(username, password, limit, package_name, agent_name, agent_type, agent_city, notes)

		this.setState({
			login_info: {
				username: "",
				password: "",
				package_name: "FREE_TRIAL",
				agent_name: "",
				agent_type: "",
				agent_city: "",
				notes: ""
			}
		})
	
	}
	
	render() {
 		return <div className="school-sign-up page">
			<div className="title"> Sign-Up</div>
				
			<div className="section form">
				<div className="divider">School Information</div>
				<div className="row">
					<label>School Name:</label>
					<input type="text" {...this.former.super_handle(["username"])}/>
				</div>
				<div className="row">
					<label>Password:</label>
					<input type="text" {...this.former.super_handle(["password"])}/>
				</div>
				<div className="row">
					<label>Package</label>
					<select {...this.former.super_handle(["package_name"])}>
						<option value="FREE_TRIAL">Free Trial</option>
						<option value="TALEEM1">Taleem-1</option>
						<option value="TALEEM2">Taleem-2</option>
						<option value="TALEEM3">Taleem-3</option>
					</select>
				</div>

				<div className="divider">Agent Information</div>
				<div className="row">
					<label>Agent Name:</label>
					<input type="text" {...this.former.super_handle(["agent_name"])}/>
				</div>
				<div className="row">
					<label>City</label>
					<input type="text" {...this.former.super_handle(["agent_city"])}/>
				</div>
				<div className="row">
					<label>Type</label>
					<input type="text" {...this.former.super_handle(["agent_type"])}/>
				</div>
				<div className="row">
					<label>Notes:</label>
					<textarea {...this.former.super_handle(["notes"])}/>
				</div>
				<div className="button save" onClick={() => this.onSignUp()}> SignUp</div>
			</div>
		</div>
	}
}

export default connect( state => ({}), ( dispatch: Function ) => ({
	createSchoolLogin: (username: string, password: string, limit: number, package_name: string, agent_name: string, agent_type: string, agent_city: string, notes: string) => dispatch(createSchoolLogin(username, password, limit, package_name, agent_name, agent_type, agent_city, notes))
}))(SignUp)