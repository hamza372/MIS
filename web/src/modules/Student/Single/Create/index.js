import React, { Component } from 'react'
import moment from 'moment';
import { v4 } from 'node-uuid'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom';

import { createStudentMerge } from 'actions'

import Former from 'utils/former'

import './style.css'

// this page will have all the profile info for a teacher.
// all this data will be editable.

// should come up with reusable form logic. 
// I have an object with a bunch of fields
// text and date input, dropdowns....

const blankStudent = {
	Name: "",
	CNIC: "",
	Gender: "",
	Phone: "",
	Fee: 0,
	Active: true,

	ManCNIC: "",
	Birthdate: moment().subtract(20, "year"),
	Address: "",
	Notes: "",
	StartDate: moment(),
}
// should be a dropdown of choices. not just teacher or admin.

class SingleStudent extends Component {

	constructor(props) {
		super(props);

		const id = props.match.params.id;

		this.state = {
			profile: props.students[id] || blankStudent,
			redirect: false
		}

		this.former = new Former(this, ["profile"])
	}

	isNew = () => this.props.location.pathname.indexOf("new") >= 0

	onSave = () => {
		console.log('save!', this.state.profile)
		const id = v4();

		const student = {
			id,
			...this.state.profile
		}

		this.props.save(student)

		this.setState({
			redirect: this.isNew() ? `/student/${student.id}/profile` : false
		})
	}

	render() {

		if(this.state.redirect) {
			console.log('redirecting....')
			return <Redirect to={this.state.redirect} />
		}

		return <div className="single-student">
				<div className="title">Edit Student</div>
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
						<label>Phone Number</label>
						<input type="tel" {...this.former.super_handle(["Phone"])} placeholder="Phone Number" />
					</div>

					<div className="row">
						<label>Monthly Fee</label>
						<input type="number" {...this.former.super_handle(["Fee"])} placeholder="Monthly Fee"/>
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
						<label>Notes</label>
						<textarea {...this.former.super_handle(["Notes"])} placeholder="Notes" />
					</div>

					<div className="row">
						<label>Start Date</label>
						<input type="date" onChange={this.former.handle(["StartDate"])} value={moment(this.state.profile.StartDate).format("YYYY-MM-DD")} placeholder="Start Date"/>
					</div>

					<div className="save button" onClick={this.onSave}>Save</div>
				</div>
			</div>
	}
}

export default connect(state => ({ students: state.db.students }) , dispatch => ({ 
	save: (student) => dispatch(createStudentMerge(student)) 
 }))(SingleStudent);