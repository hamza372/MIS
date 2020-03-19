import React, { Component } from 'react'
import { createSchoolLogin, getSchoolList } from 'actions/index'
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import Former from 'former';
import checkCompulsoryFields from 'utils/checkCompulsoryFields';

import './style.css'

interface P {
	auth: RootReducerState["auth"]
	schoolList: RootReducerState["school_Info"]["school_list"]
	getSchoolList: () => any
	createSchoolLogin: (username: string, password: string, limit: number, value: SignUpValue) => any
}

interface S {

	username: string
	password: string
	value: SignUpValue
	agents: string[]
}

interface Routeinfo {
	id: string
}

type propTypes = RouteComponentProps<Routeinfo> & P

const Span = () => <span style={{ color: "red" }}>*</span>
class SignUp extends Component<propTypes, S> {

	former: Former
	constructor(props: propTypes) {
		super(props)

		const area_manager_name = (props.auth.role && props.auth.role === "AREA_MANAGER" ? (props.auth.id || "") : "") as SignUpValue["area_manager_name"]
		const user = props.auth.id || ""

		this.state = {
			username: "",
			password: "",
			value: {
				package_name: "FREE_TRIAL",
				area_manager_name,
				office: "",
				city: "",
				type_of_login: "",
				school_name: "",
				owner_name: "",
				owner_easypaisa_number: "",

				association_name: "",

				agent_name: "",
				notes: "",
				owner_phone: "",
				user,
				school_type: "",
				owner_other_job: "",
				computer_operator: "",
				previous_management_system: "",
				previous_software_name: ""
			},
			agents: [
				"M. Shahbaz",
				"Sadaf Tauqeer",
				"Umar Zaheer",
				"M.Zikran shakeel",
				"M.Farooq",
				"Tabassum Munir",
				"M.Ahmad",
				"Qasim M. Chadhary",
				"M.Tayyab",
				"Tariq Mehmood",
				"Haroon Shahzad",
				"Sheraz Ahmed",
				"M.Suleman",
				"Raheel Abbas",
				"Huraira Abbas",
				"Zeeshan",
				"Raza Mustafa"
			],
		}

		this.former = new Former(this, [], [
			// SCHOOL REFERRAL BLOCK
			{
				path: ["value", "school_name"],
				value: "",
				depends: [
					"OR",
					{
						path: ["value", "type_of_login"],
						value: "SCHOOL_REFERRAL"
					},
					{
						path: ["value", "type_of_login"],
						value: "AGENT_SCHOOL"
					}
				]
			},
			{
				path: ["value", "owner_easypaisa_number"],
				value: "",
				depends: [
					"OR",
					{
						path: ["value", "type_of_login"],
						value: "SCHOOL_REFERRAL"
					},
					{
						path: ["value", "type_of_login"],
						value: "AGENT_SCHOOL"
					}
				]
			},
			// ASSOCIATION BLOCK
			{
				path: ["value", "association_name"],
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
				path: ["value", "agent_name"],
				value: "",
				depends: [
					"OR",
					{
						path: ["value", "type_of_login"],
						value: "AGENT"
					},
					{
						path: ["value", "type_of_login"],
						value: "AGENT_SCHOOL"
					}
				]
			},

			{
				path: ["value", "previous_software_name"],
				value: "",
				depends: [
					{
						path: ["value", "previous_management_system"],
						value: "SOFTWARE"
					}
				]
			}
		])
	}
	componentDidMount() {
		this.props.getSchoolList()
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
			...this.state.value
		}

		console.log(value)

		const compulsory_fields = checkCompulsoryFields(this.state.value,
			[
				["area_manager_name"],
				["office"],
				["city"],
				["type_of_login"],
				["owner_phone"],
				["owner_name"],
				["school_type"],
				["owner_other_job"],
				["computer_operator"],
				["previous_management_system"]]
		)

		if (compulsory_fields) {
			const erroText = `Please Fill ${(compulsory_fields as string[][]).map(x => x[0] === "agent_name" ? "Agent Name" : x[0]).join(", ")} !`
			return window.alert(erroText)
		}

		const limit = this.getLimitFromPackage(this.state.value.package_name)

		if (this.former.check(["value", "school_name"])) {
			const compulsory_fields = checkCompulsoryFields(this.state.value,
				[
					["school_name"],
					["owner_easypaisa_number"]
				]
			)
			if (compulsory_fields) {
				const erroText = `Please Fill ${(compulsory_fields as string[][]).map(x => x[0] === "agent_name" ? "Agent Name" : x[0]).join(", ")} !`
				return window.alert(erroText)
			}
		}
		else if (this.former.check(["value", "association_name"])) {
			const compulsory_fields = checkCompulsoryFields(this.state.value,
				[
					["association_name"],
				]
			)
			if (compulsory_fields) {
				const erroText = `Please Fill ${(compulsory_fields as string[][]).map(x => x[0] === "agent_name" ? "Agent Name" : x[0]).join(", ")} !`
				return window.alert(erroText)
			}
		}

		const login_detail_fields = checkCompulsoryFields(this.state,
			[
				["username"],
				["password"]
			]
		)

		if (login_detail_fields) {
			const erroText = `Please Fill ${(login_detail_fields as string[][]).map(x => x[0] === "agent_name" ? "Agent Name" : x[0]).join(", ")} !`
			return window.alert(erroText)
		}

		this.props.createSchoolLogin(username, password, limit, value)
	}

	render() {

		const { agents } = this.state
		const { role } = this.props.auth

		return <div className="school-sign-up page">

			<div className="title"> New Login</div>
			<div className="section form">
				{role !== "AREA_MANAGER" && <div className="row">
					<label>Area Manager <Span /></label>
					<select {...this.former.super_handle(["value", "area_manager_name"])}>
						<option value="">Select</option>
						<option value="AYESHA">Ayesha</option>
						<option value="UMER">Umer</option>
						<option value="ZAHID"> Zahid </option>
						<option value="FAROOQ">Farooq</option>
						<option value="KAMRAN">Kamran</option>
						<option value="NOMAN">Noman</option>
						<option value="ALI_ZOHAIB"> Ali Zohaib</option>
					</select>
				</div>}
				<div className="row">
					<label>Office <Span /></label>
					<select {...this.former.super_handle(["value", "office"])}>
						<option value="">Select</option>
						<option value="LAHORE">Lahore</option>
						<option value="SARGODHA">Sargodha</option>
						<option value="SIALKOT">Sialkot</option>
						<option value="GUJRANWALA">Gujranwala</option>
						<option value="FAISALABAD">Faisalabad</option>
						<option value="ISLAMABAD">Islamabad</option>
						<option value="RAWALPINDI">Rawalpindi</option>
						<option value="KASUR"> Kasur</option>
						<option value="SHEIKHUPURA"> Sheikhupura</option>
					</select>
				</div>

				<div className="row">
					<label>City/Area <Span /></label>
					<input type="text" {...this.former.super_handle(["value", "city"])} placeholder="city" />
				</div>

				<div className="row">
					<label>Strategy <Span /></label>
					<select {...this.former.super_handle(["value", "type_of_login"])}>
						<option value="">Select</option>
						<option value="AGENT">Agent </option>
						<option value="AGENT_SCHOOL"> Agent-School</option>
						<option value="ASSOCIATION">Association</option>
						<option value="EDFIN">EdFin</option>
						<option value="SCHOOL_REFERRAL">School Referrals</option>
						<option value="INDIVIDUAL">Individual </option>
						<option value="ILM_EXCHANGE">Ilm Exchange</option>
						<option value="FACEBOOK">Facebook</option>
					</select>
				</div>
			</div>

			{this.former.check(["value", "school_name"]) && <div className="section form">
				<div className="divider"> Referral School Information </div>

				<div className="row">
					<label>School Name <Span /></label>
					<input list="schl-list" {...this.former.super_handle(["value", "school_name"])} placeholder="school name" />
					<datalist id="schl-list">
						{
							this.props.schoolList.map(s => <option key={s} value={s} />)
						}
					</datalist>
				</div>

				<div className="row">
					<label>Owner Easy Paisa <Span /></label>
					<input type="number" {...this.former.super_handle(["value", "owner_easypaisa_number"])} placeholder="Easy Paisa" />
				</div>
			</div>}

			{this.former.check(["value", "association_name"]) && <div className="section form">
				<div className="divider">Association Information</div>
				<div className="row">
					<label>Association <Span /></label>
					<input type="text" {...this.former.super_handle(["value", "association_name"])} placeholder="Association Name" />
				</div>
			</div>}

			{this.former.check(["value", "agent_name"]) && <div className="section form">
				<div className="divider">Agent Information <Span /></div>

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
					<select {...this.former.super_handle(["value", "agent_name"])}>
						<option value="">Select Agent</option>
						{
							agents
								.map(name => <option key={name} value={name}>{name}</option>)
						}

					</select>
				</div>

			</div>}

			<div className="section form">
				<div className="divider">School Information</div>
				<div className="row">
					<label>Owner Name:<Span /></label>
					<input type="text" {...this.former.super_handle(["value", "owner_name"])} placeholder="name" />
				</div>
				<div className="row">
					<label>Owner Phone <Span /></label>
					<input type="number" placeholder="number" {...this.former.super_handle(["value", "owner_phone"])} />
				</div>
				<div className="row">
					<label>School Type <Span /></label>
					<select {...this.former.super_handle(["value", "school_type"])}>
						<option value="">Select</option>
						<option value="RURAL">Rural</option>
						<option value="URBAN">Urban</option>
					</select>
				</div>
				<div className="row">
					<label>Does the school owner have another job? (where he invest time instead of school) <Span /></label>
					<select {...this.former.super_handle(["value", "owner_other_job"])}>
						<option value="">Select</option>
						<option value="YES">Yes</option>
						<option value="NO">No</option>
					</select>
				</div>
				<div className="row">
					<label>Is there any computer operator in the school responsible to use MISchool (any specific teacher or person who act as a computer operator) <Span /></label>
					<select {...this.former.super_handle(["value", "computer_operator"])}>
						<option value="">Select</option>
						<option value="YES">Yes</option>
						<option value="NO">No</option>
					</select>
				</div>
				<div className="row">
					<label>What was their previous management system? <Span /></label>
					<select {...this.former.super_handle(["value", "previous_management_system"])}>
						<option value="">Select</option>
						<option value="REGISTER">Register</option>
						<option value="EXCEL">Excel</option>
						<option value="SOFTWARE">Software</option>
					</select>
				</div>
				{this.former.check(["value", "previous_software_name"]) && <div className="row">
					<label>Please mention the name of the previous software</label>
					<input type="text" placeholder="name" {...this.former.super_handle(["value", "previous_software_name"])} />
				</div>}

				<div className="row">
					<label>Notes:</label>
					<textarea {...this.former.super_handle(["value", "notes"])} placeholder="Additional Info (If Any)" />
				</div>
			</div>
			<div className="section form">
				<div className="divider">Login Credentials</div>
				<div className="row">
					<label>School ID: <Span /></label>
					<input type="text" {...this.former.super_handle(["username"])} placeholder="username" />
				</div>
				<div className="row">
					<label>Password:<Span /></label>
					<input type="text" {...this.former.super_handle(["password"])} placeholder="password" />
				</div>
				<div className="row">
					<label>Package<Span /></label>
					<select {...this.former.super_handle(["value", "package_name"])}>
						<option value="FREE_TRIAL">Free Trial</option>
						<option value="TALEEM1">Taleem-1</option>
						<option value="TALEEM2">Taleem-2</option>
						<option value="TALEEM3">Taleem-3</option>
					</select>
				</div>
				<div className="button save" onClick={() => this.onSave()}> SignUp</div>
			</div>
		</div>
	}
}

export default connect((state: RootReducerState) => ({
	auth: state.auth,
	schoolList: state.school_Info.school_list
}), (dispatch: Function) => ({
	createSchoolLogin: (username: string, password: string, limit: number, value: SignUpValue) => dispatch(createSchoolLogin(username, password, limit, value)),
	getSchoolList: () => dispatch(getSchoolList())
}))(SignUp)