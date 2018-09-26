import React, { Component } from 'react'
import moment from 'moment';
import { v4 } from 'node-uuid'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom';

import { createStudentMerge } from 'actions'

import Banner from 'components/Banner'
import Former from 'utils/former'

import './style.css'

// this page will have all the profile info for a teacher.
// all this data will be editable.

// should come up with reusable form logic. 
// I have an object with a bunch of fields
// text and date input, dropdowns....

const blankStudent = () => ({
	Name: "",
	BForm: "",
	Gender: "",
	Phone: "",
	Fee: 0,
	Active: true,

	ManCNIC: "",
	ManName: "",
	Birthdate: moment().subtract(20, "year"),
	Address: "",
	Notes: "",
	StartDate: moment(),

	attendance: {},
	section_id: ""
})
// should be a dropdown of choices. not just teacher or admin.

class SingleStudent extends Component {

	constructor(props) {
		super(props);

		const id = props.match.params.id;

		this.state = {
			profile: props.students[id] || blankStudent(),
			redirect: false,
			saveBanner: false
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
			saveBanner: true
		})

		setTimeout(() => {
			this.setState({
				saveBanner: false,
				redirect: this.isNew() ? `/student/${student.id}/profile` : false
			})
		}, 3000);
	}

	render() {

		if(this.state.redirect) {
			console.log('redirecting....')
			return <Redirect to={this.state.redirect} />
		}

		return <div className="single-student">
				{ this.state.saveBanner ? <Banner isGood={true} text="Saved!" /> : false }

				<div className="title">Edit Student</div>


				<div className="form">
					<div className="divider">Personal Information</div>
					<div className="row">
						<label>Full Name</label>
						<input type="text" {...this.former.super_handle(["Name"])} placeholder="Full Name" />
					</div>
					<div className="row">
						<label>B-Form Number</label>
						<input type="number" {...this.former.super_handle(["BForm"])} placeholder="BForm" />
					</div>

					<div className="row">
						<label>Date of Birth</label>
						<input type="date" onChange={this.former.handle(["Birthdate"])} value={moment(this.state.profile.Birthdate).format("YYYY-MM-DD")} placeholder="Date of Birth" />
					</div>

					<div className="row">
						<label>Gender</label>
						<select {...this.former.super_handle(["Gender"])}>
							<option value='' disabled>Please Set a Gender</option>
							<option value="male">Male</option>
							<option value="female">Female</option>
						</select>
					</div>

					<div className="row">
						<label>Father Name</label>
						<input type="text" {...this.former.super_handle(["ManName"])} placeholder="Father Name" />
					</div>

					<div className="row">
						<label>Father CNIC</label>
						<input type="number" {...this.former.super_handle(["ManCNIC"])} placeholder="Father CNIC" />
					</div>

					<div className="divider">Contact Information</div>

					<div className="row">
						<label>Phone Number</label>
						<input type="tel" {...this.former.super_handle(["Phone"])} placeholder="Phone Number" />
					</div>

					<div className="row">
						<label>Address</label>
						<input type="text" {...this.former.super_handle(["Address"])} placeholder="Address" />
					</div>

					<div className="divider">School Information</div>

					{ this.state.profile.class_id === '' ? false : <div className="row">
						<label>Class Section</label>
						<select {...this.former.super_handle(["section_id"])}>
							{
								 [{id: '', name: 'Please Select a Section'}, ...Object.values(this.props.classes) // collapse into label class - section name. value is section id
								 	.reduce((agg, c) => {
										 return [...agg, ...Object.entries(c.sections)
										 	.reduce((agg2, [id, section]) => { 
												return [...agg2, { id, name:`${c.name}-${section.name}` }]
											 }, [])]
									 }, [])]
									.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
							}
						</select>
					</div>
					}

					<div className="row">
						<label>Monthly Fee</label>
						<input type="number" {...this.former.super_handle(["Fee"])} placeholder="Monthly Fee"/>
					</div>

					<div className="row">
						<label>Active</label>
						<input type="checkbox" {...this.former.super_handle(["Active"])} />
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

export default connect(state => ({ students: state.db.students, classes: state.db.classes }) , dispatch => ({ 
	save: (student) => dispatch(createStudentMerge(student)) 
 }))(SingleStudent);