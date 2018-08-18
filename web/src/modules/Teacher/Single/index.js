import React, { Component } from 'react'
import moment from 'moment';
import { v4 } from 'node-uuid'
import { connect } from 'react-redux'
import { createMerge, createMerges } from 'actions'
import { hash } from 'utils'

import Layout from 'components/Layout'
import Former from 'utils/former'

import './style.css'

// this page will have all the profile info for a teacher.
// all this data will be editable.

// should come up with reusable form logic. 
// I have an object with a bunch of fields
// text and date input, dropdowns....

const blankTeacher = {
	Name: "",
	CNIC: "",
	Gender: "",
	Username: "",
	Password: "",
	Married: false,
	Phone: "",
	Salary: 0,
	Active: true,

	ManCNIC: "",
	Birthdate: moment().subtract(20, "year"),
	Address: "",
	Qualification: "",
	Experience: "",
	HireDate: moment(),
}

class SingleTeacher extends Component {

	constructor(props) {
		super(props);
		console.log(props)

		const id = props.match.params.id;


		this.state = {
			profile: id === 'new' ? blankTeacher : props.teachers[id] || blankTeacher,
		}

		this.former = new Former(this, ["profile"])
	}

	onSave = () => {
		// dispatch merge action, which should come from props.

		const id = v4();

		if(this.state.profile.Password.length !=128) {
			hash(this.state.profile.Password).then(hashed => {
				this.props.save({
					id,
					...this.state.profile,
					Password: hashed
				})
			})
		}
		else {
			this.props.save({
				id,
				...this.state.profile,
			})
		}
		console.log('save')
	}

	render() {

		console.log(this.state.profile.Salary)

		return <Layout>
			<div className="single-teacher">
				<div className="form">
					<div className="row">
						<label>Name</label>
						<input type="text" {...this.former.super_handle(["Name"])} placeholder="Name" />
					</div>
					<div className="row">
						<label>CNIC</label>
						<input type="text" {...this.former.super_handle(["CNIC"])} placeholder="CNIC" />
					</div>
					<div className="row">
						<label>Gender</label>
						<select {...this.former.super_handle(["Gender"])}>
							<option value="male">Male</option>
							<option value="female">Female</option>
						</select>
					</div>
					<div className="row">
						<label>Username</label>
						<input type="text" {...this.former.super_handle(["Username"])} placeholder="Username" />
					</div>
					<div className="row">
						<label>Password</label>
						<input type="password" {...this.former.super_handle(["Password"])} placeholder="Password" />
					</div>
					<div className="row">
						<label>Married</label>
						<input type="checkbox" {...this.former.super_handle(["Married"])} />
					</div>
					<div className="row">
						<label>Phone Number</label>
						<input type="tel" {...this.former.super_handle(["Phone"])} placeholder="Phone Number" />
					</div>
					<div className="row">
						<label>Monthly Salary</label>
						<input type="number" {...this.former.super_handle(["Salary"])} placeholder="Monthly Salary"/>
					</div>
					<div className="row">
						<label>Active</label>
						<input type="checkbox" {...this.former.super_handle(["Active"])} />
					</div>

					<div className="row">
						<label>Husband/Father CNIC</label>
						<input type="text" {...this.former.super_handle(["ManCNIC"])} placeholder="Father/Husband CNIC" />
					</div>
					<div className="row">
						<label>Birth Date</label>
						<input type="date" onChange={this.former.handle(["Birthdate"])} value={moment(this.state.profile.Birthdate).format("YYYY-MM-DD")} placeholder="Date of Birth" />
					</div>

					<div className="row">
						<label>Address</label>
						<input type="text" {...this.former.super_handle(["Address"])} placeholder="Address" />
					</div>
					<div className="row">
						<label>Experience</label>
						<textarea {...this.former.super_handle(["Experience"])} placeholder="Experience" />
					</div>

					<div className="row">
						<label>Hire Date</label>
						<input type="date" onChange={this.former.handle(["HireDate"])} value={moment(this.state.profile.HireDate).format("YYYY-MM-DD")} placeholder="Hire Date"/>
					</div>

					<div className="save button" onClick={this.onSave}>Save</div>
				</div>
			</div>
		</Layout>
	}
}

export default connect(state => ({ teachers: state.db.teachers }) , dispatch => ({ 
	save: (teacher) => {
		//dispatch(createMerge(["db", "teachers", teacher.id], teacher))

		dispatch(createMerges([
			{path: ["db", "teachers", teacher.id], value: teacher},
			{path: ["db", "users", teacher.id], value: {
				username: teacher.Username,
				password: teacher.Password,
				type: "teacher"
			}}
		]))
	}
 }))(SingleTeacher);