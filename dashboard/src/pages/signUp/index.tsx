import React, { Component } from 'react'
import { createSchoolLogin } from '../../actions/index'
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import Former from 'former';
import checkCompulsoryFields from '../../utils/checkCompulsoryFields';

import './style.css'

interface P {
	createSchoolLogin: (username: string, password: string, limit: number, value: SignUpValue) => any
}

interface S {

	username: string
	password: string
	value: {
		package_name: "FREE_TRIAL" | "TALEEM1" | "TALEEM2" | "TALEEM3"
		area_manager_name: "AYESHA" | "UMER" | "FAROOQ" | "ZAHID" | "KAMRAN" | "NOMAN" | ""
		office: "" | "LAHORE" | "SARGODHA" | "SIALKOT" | "GUJRANWALA" | "FAISALABAD"
		city: string
		type_of_login: "" | "SCHOOL_REFERRAL" | "ASSOCIATION" | "EDFIN" | "INDIVIDUAL" | "AGENT" | "PLATFORM"

		school_name: string
		owner_name: string
		owner_easypaisa_number: string

		association_name: string

		agent_name: string
		agent_easypaisa_number: string

		notes: string
	}
	agents: {
		[id: string]: string
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
			username: "",
			password: "",
			value: {
				package_name: "FREE_TRIAL",
				area_manager_name: "",
				office: "",
				city: "",
				type_of_login: "",
		
				school_name: "",
				owner_name: "",
				owner_easypaisa_number: "",
		
				association_name: "",
		
				agent_name: "",
				agent_easypaisa_number: "",
				notes: ""
			},
			agents: {
				"33102-9810681-3": "M_Shahbaz" ,
				"33105-5781621-0": "Sadaf_Tauqeer" ,
				"33202-7012810-1": "Umar_Zaheer",
				"33100-1186757-3": "M_Zikran_Shakeel",
				"36501-1621413-9": "M_Farooq",
				"33100-0579798-3": "Tabassum_Munir",
				"33100-4103401-9": "M_Ahmad",
				"33102-8009325-7": "Qasim_M_Chaudhary",
				"33102-1796653-9": "M_Tayyab",
				"34104-6359607-3": "Tariq_Mehmood",
				"34104-1789481-1": "Haroon_Shezhad",
				"34603-7984945-7": "Sheraz_Ahmed",
				"34603-7437696-1": "M_Suleman",
				"34201-1911838-9": "Raheel_Abbas",
				"34603-6670462-7": "Huraira_Abbas",
				"34603-1880990-3": "Zeeshan",
				"34201-2295675-9": "Raza_Mustafa"
			}
		}
	
		this.former = new Former(this,[], [
			// SCHOOL REFERRAL BLOCK
			{
				path:["value","school_name"],
				value: "",
				depends: [
					{
						path: ["value", "type_of_login"],
						value: "SCHOOL_REFERRAL"
					}
				]
			},
			{
				path:["value", "owner_name"],
				value: "",
				depends: [
					{
						path: ["value", "type_of_login"],
						value: "SCHOOL_REFERRAL"
					}
				]
			},
			{
				path:["value", "owner_easypaisa_number"],
				value: "",
				depends: [
					{
						path: ["value", "type_of_login"],
						value: "SCHOOL_REFERRAL"
					}
				]
			},
			// ASSOCIATION BLOCK
			{
				path:["value", "association_name"],
				value: "",
				depends: [
					{
						path: ["value", "type_of_login"],
						value: "ASSOCIATION"
					}
				]
			},

			// AGENT BLOCK
			{
				path:["value", "agent_name"],
				value: "",
				depends: [
					{
						path: ["value", "type_of_login"],
						value: "AGENT"
					}
				]
			},
			{
				path:["value", "agent_easypaisa_number"],
				value: "",
				depends: [
					{
						path: ["value", "type_of_login"],
						value: "AGENT"
					}
				]
			}
		])
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

	onSave = () => {

		const { username, password } = this.state
		
		console.log(this.state.value)

		const value = {
			...this.state.value,
			agent_name: this.state.agents[this.state.value.agent_easypaisa_number]
		}

		console.log(value)

		const compulsory_fields = checkCompulsoryFields(this.state.value,
			[
				["area_manager_name"],
				["office"],
				["city"],
				["type_of_login"],
			]
		)

		if(compulsory_fields) {
			const erroText = `Please Fill ${(compulsory_fields as string[][]).map(x => x[0] === "agent_name" ? "Agent Name" : x[0]).join(", ")} !`
			return window.alert(erroText)
		}

		const limit = this.getLimitFromPackage(this.state.value.package_name)

		if(this.former.check(["value","school_name"])) {
			const compulsory_fields = checkCompulsoryFields(this.state.value,
				[
					["school_name"],
					["owner_name"],
					["owner_easypaisa_number"]
				]
			)
			if(compulsory_fields) {
				const erroText = `Please Fill ${(compulsory_fields as string[][]).map(x => x[0] === "agent_name" ? "Agent Name" : x[0]).join(", ")} !`
				return window.alert(erroText)
			}
		}
		else if(this.former.check(["value","association_name"])) {
			const compulsory_fields = checkCompulsoryFields(this.state.value,
				[
					["association_name"],
				]
			)
			if(compulsory_fields) {
				const erroText = `Please Fill ${(compulsory_fields as string[][]).map(x => x[0] === "agent_name" ? "Agent Name" : x[0]).join(", ")} !`
				return window.alert(erroText)
			}
		}
		else if(this.former.check(["value","agent_name"])) {
			const compulsory_fields = checkCompulsoryFields(this.state.value,
				[
					["agent_easypaisa_number"]
				]
			)
			if(compulsory_fields) {
				const erroText = `Please Fill ${(compulsory_fields as string[][]).map(x => x[0] === "agent_easypaisa_number" ? "Agent Name" : x[0]).join(", ")} !`
				return window.alert(erroText)
			}
			
		}

		const login_detail_fields = checkCompulsoryFields(this.state,
			[
				["username"],
				["password"]
			]
		)

		if(login_detail_fields) {
			const erroText = `Please Fill ${(login_detail_fields as string[][]).map(x => x[0] === "agent_name" ? "Agent Name" : x[0]).join(", ")} !`
			return window.alert(erroText)
		}

		this.props.createSchoolLogin(username, password, limit, value)
	}

	render() {

		const { agents } = this.state

		console.log(Object.entries(agents))

 		return <div className="school-sign-up page">
			<div className="title"> New School</div>

			<div className="section form">
				<div className="row">
					<label>Name</label>
					<select {...this.former.super_handle(["value","area_manager_name"])}>
						<option value="">Select</option>
						<option value="AYESHA">Ayesha</option>
						<option value="UMER">Umer</option>
						<option value="ZAHID"> Zahid </option>
						<option value="FAROOQ">Farooq</option>
						<option value="KAMRAN">Kamran</option>
					</select>
				</div>
				<div className="row">
					<label>Office</label>
					<select {...this.former.super_handle(["value","office"])}>
						<option value="">Select</option>
						<option value="LAHORE">Lahore</option>
						<option value="SARGODHA">Sargodha</option>
						<option value="SIALKOT">Sialkot</option>
						<option value="GUJRANWALA">Gujranwala</option>
						<option value="FAISALABAD">Faisalabad</option>
					</select>
				</div>

				<div className="row">
					<label>City</label>
					<input type="text" {...this.former.super_handle(["value","city"])} placeholder="city"/>
				</div>

				<div className="row">
					<label>Type</label>
					<select {...this.former.super_handle(["value", "type_of_login"])}>
						<option value="">Select</option>
						<option value="AGENT">Agent </option>
						<option value="ASSOCIATION">Association</option>
						<option value="EDFIN">EdFin</option>
						<option value="SCHOOL_REFERRAL">School Referrals</option>
						<option value="INDIVIDUAL">Individual </option>
					</select>
				</div>
			</div>

			
			{ this.former.check(["value","school_name"]) && <div className="section form">
				<div className="divider"> Referral School Information </div>
				
				<div className="row">
					<label>School Name</label>
					<input type="text" {...this.former.super_handle(["value","school_name"])} placeholder="school name"/>
				</div>
				
				<div className="row">
					<label>Owner Name:</label>
					<input type="text" {...this.former.super_handle(["value","owner_name"])} placeholder="name"/>
				</div>

				<div className="row">
					<label>Owner Easy Paisa</label>
					<input type="number" {...this.former.super_handle(["value","owner_easypaisa_number"])} placeholder="Easy Paisa"/>
				</div>
			</div>}

			{ this.former.check(["value","association_name"]) && <div className="section form">
				<div className="divider">Association Information</div>
				<div className="row">
					<label>Association</label>
					<input type="text" {...this.former.super_handle(["value","association_name"])} placeholder="Association Name"/>
				</div>
			</div>}

			{ this.former.check(["value","agent_name"]) && <div className="section form">
				<div className="divider">Agent Information</div>
			
{/* 				<div className="row">
					<label>Agent Name:</label>
					<input type="text" {...this.former.super_handle(["value","agent_name"])} placeholder="Agent Name"/>
				</div>

				<div className="row">
					<label>Agent Easy Paisa</label>
					<input type="number" {...this.former.super_handle(["value","agent_easypaisa_number"])} placeholder="Easy Paisa"/>
				</div> */}

				<div className="row">
						<label>Agent Name</label>
						<select {...this.former.super_handle(["value", "agent_easypaisa_number"])}>
							<option value=""> Select Agent</option>
							{
								Object.entries(agents)
									.map(([id, agent]) => <option key={id} value={id}>{agent}</option>)
							}

						</select>
				</div>

			</div> }
			
			<div className="section form">
				<div className="divider">SignUp Information</div>
				<div className="row">
					<label>School Name:</label>
					<input type="text" {...this.former.super_handle(["username"])} placeholder="username"/>
				</div>
				<div className="row">
					<label>Password:</label>
					<input type="text" {...this.former.super_handle(["password"])} placeholder="Password"/>
				</div>
				<div className="row">
					<label>Package</label>
					<select {...this.former.super_handle(["value","package_name"])}>
						<option value="FREE_TRIAL">Free Trial</option>
						<option value="TALEEM1">Taleem-1</option>
						<option value="TALEEM2">Taleem-2</option>
						<option value="TALEEM3">Taleem-3</option>
					</select>
				</div>

				<div className="row">
					<label>Notes:</label>
					<textarea {...this.former.super_handle(["value","notes"])} placeholder="Notes"/>
				</div>
				<div className="button save" onClick={() => this.onSave()}> SignUp</div>
			</div>
		</div>
	}
}

export default connect( state => ({}), ( dispatch: Function ) => ({
	createSchoolLogin: (username: string, password: string, limit: number, value: SignUpValue) => dispatch(createSchoolLogin(username, password, limit, value))
}))(SignUp)