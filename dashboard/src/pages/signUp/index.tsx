import React, { Component } from 'react'
import { Layout } from '../../components/Layout';

import { createSchoolLogin } from '../../actions/index'

import './style.css'
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import Former from 'former';
import checkCompulsoryFields from '../../utils/checkCompulsoryFields';

interface P {
	createSchoolLogin: (username: string, password: string, limit: number, agent_name: string, agent_type: string, agent_city: string, notes: string) => any
}

interface S {
	login_info: {
		username: string,
		password: string,
		limit: string,
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
				limit: "0",
				agent_name: "",
				agent_type: "",
				agent_city: "",
				notes: ""
			}
			
		}

		this.former = new Former(this,["login_info"])
	}

	onSignUp = () => {
		const { username, password, limit, agent_name, agent_type, agent_city, notes} = this.state.login_info

		const compulsory_fields = checkCompulsoryFields(this.state.login_info,
			[
				["username"],
				["password"],
				["limit"],
				["agent_name"],
				["agent_type"],
				["agent_city"]
			]
		)

		if(compulsory_fields) {
			const erroText = `Please Fill ${(compulsory_fields as string[][]).map(x => x[0] === "agent_name" ? "Agent Name" : x[0]).join(", ")} !`

			return window.alert(erroText)
		}

		console.log("Login Details", this.state.login_info)
		/* this.props.createSchoolLogin(
			username,
			password,
			parseFloat(limit),
			agent_name,
			agent_type,
			agent_city,
			notes
		) */

		window.alert(`Login Created Successfully!!\nUSERNAME: ${username}\nPASSWORD: ${password}`)

		this.setState({
			login_info: {
				username: "",
				password: "",
				limit: "0",
				agent_name: "",
				agent_type: "",
				agent_city: "",
				notes: ""
			}
		})
	
	}
	
	render() {

/* 		console.log("From Render => ", this.state.login_info)
 */		return <Layout title="New-School">
			<div className="school-sign-up">

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
						<select {...this.former.super_handle(["limit"])}>
							<option value="0">Free Trial</option>
							<option value="150">Taleem-1</option>
							<option value="300">Taleem-2</option>
							<option value="3">Taleem-3</option>
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
		</Layout> 
		
	}
}

export default connect( state => ({}), ( dispatch: Function ) => ({
	createSchooLogin: (username: string, password: string, limit: number, agent_name: string, agent_type: string, agent_city: string, notes: string) => dispatch(createSchoolLogin(username, password, limit, agent_name, agent_type, agent_city, notes))
}))(SignUp)