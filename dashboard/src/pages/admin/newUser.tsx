import React, { Component } from 'react'
import Former from 'former'
import { RouteComponentProps } from 'react-router'
import { connect } from 'react-redux'
import { createUser } from 'actions'

import "./style.css"


interface P {
	createUser: (name: string, password: string, permissions: any) => any
}

interface routeInfo {
	
}

type propTypes = RouteComponentProps<routeInfo> & P

interface S {
	name: string
	password: string
	role: string
	permissions: {
		[id: string]: boolean
	}
}

const roles = [
	"ADMIN",
	"AREA_MANAGER",
];

const permissions = [
	"new_school",
	"stats",
	"trials",
	"new_user"
];

class newUser extends Component<propTypes, S> {

	former: Former
	constructor(props: propTypes) {
		super(props)
	
		this.state = {
			name: "",
			password: "",
			role: "ADMIN",
			permissions: {
				new_school: true,
				stats: true,
				trials: true,
				new_user: true
			}
		}

		this.former = new Former(this,[])
	}

	checkboxHandler = ( type: string ) => {
		this.setState({
			permissions: {
				...this.state.permissions,
				[type]: !this.state.permissions[type]
			}
		})
	}

	onCreate = () => {
		const { name, password, role, permissions } = this.state

		if (name === "" || password === "" || role === "") {
			window.alert("Please Make sure all the fields are filled !!")
			return
		}

		if (!window.confirm("Have you Double Checked the Information you provided and still want to create this User ?")) {
			return
		}

		const perm = {
			role,
			permissions
		}

		//trimming if they accidentaly add any whitspace
		this.props.createUser(name.trim(), password.trim(), perm)
		
		this.setState({
			name: "",
			password: ""
		})
	}
	

	render() {
		return <div className="page new-user">
			<div className="title"> New User</div>
			<div className="form section" style={{ width: "75%" }}>
				<div className="row">
					<label>Role:</label>
					<select {...this.former.super_handle(["role"])}>
					{
						roles.map((role) => <option key={role} value={role}> {role} </option>)
					}
					</select>
				</div>
				{
					this.state.role === "AREA_MANAGER" ? <div className="row">
						<label>Name</label>
						<select {...this.former.super_handle(["name"])}>
							<option value="">Select</option>
							<option value="AYESHA">Ayesha</option>
							<option value="UMER">Umer</option>
							<option value="ZAHID"> Zahid </option>
							<option value="FAROOQ">Farooq</option>
							<option value="KAMRAN">Kamran</option>
							<option value="NOMAN">Noman</option>
							<option value="ALI_ZOHAIB"> Ali Zohaib</option>
						</select>
					</div> : <div className="row">
						<label>Name:</label>
						<input type="text" placeholder="Name" {...this.former.super_handle(["name"])} />
					</div>
				}
				<div className="row">
					<label>Password:</label>
					<input type="text" placeholder="Password" {...this.former.super_handle(["password"])}/>
				</div>

				{
					this.state.role !== "ADMIN" && <div>
						<div>User Permissions</div>
						<div className="section">
							{
								permissions.map((p: string) => {
									return <div className="checkbox-row" key={p}>
										<label> {p} </label>
										<input type="checkbox" defaultChecked={this.state.permissions[p]} onChange={() => this.checkboxHandler(p)}/>
									</div>
								})
							}
						</div>
					</div>	

				}
				<div className="button blue" onClick={() => this.onCreate()}>Create</div>
			</div>
		</div>
	}
}
export default connect((state: RootReducerState) => ({}), (dispatch: Function) => ({
	createUser: (name: string, password: string, permissions: any) => dispatch(createUser(name, password, permissions))
}))(newUser)
