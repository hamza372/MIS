import React, { Component } from 'react'
import moment from 'moment';
import { v4 } from 'node-uuid'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom';

import getSectionsFromClasses from 'utils/getSectionsFromClasses'
import checkCompulsoryFields from 'utils/checkCompulsoryFields'
import { createStudentMerge, deleteStudent } from 'actions'
import Banner from 'components/Banner'
import Former from 'utils/former'

import './style.css'

// this page will have all the profile info for a teacher.
// all this data will be editable.

// should come up with reusable form logic. 
// I have an object with a bunch of fields
// text and date input, dropdowns....

const blankStudent = () => ({
	id: v4(),
	Name: "",
	RollNumber: "",
	BForm: "",
	Gender: "",
	Phone: "",
	Fee: 0,
	Active: false,

	ManCNIC: "",
	ManName: "",
	Birthdate: "",
	Address: "",
	Notes: "",
	StartDate: moment(),
	AdmissionNumber: "",

	fees: {},
	payments: {},
	attendance: {},
	section_id: "",
	tags:{}
})
// should be a dropdown of choices. not just teacher or admin.

class ProspectiveStudent extends Component {

	constructor(props) {
		super(props);

		const id = props.match.params.id;

		this.state = {
			profile: props.students[id] || blankStudent(),
			redirect: false,
			banner: {
				active: false,
				good: true,
				text: "Saved!"
			}
		}

		this.former = new Former(this, ["profile"])

		// console.log(this.state.profile)
	}

	isNew = () => this.props.location.pathname.indexOf("new") >= 0

	onSave = () => {
		const student = this.state.profile;
		
		let compulsory_paths = [ ["Name"],["section_id"] ];

		const compulsoryFields = checkCompulsoryFields(this.state.profile, compulsory_paths);

		if(compulsoryFields) 
		{
			const errorText = "Please fill " + compulsoryFields.map(x => x[0] === "section_id" ? "Section ID" : x[0]).join(", ");
			
				return this.setState({
					banner: {
						active : true,
						good: false,
						text: errorText
					}
				})
		}

		this.state.profile.tags = {
			...this.state.profile.tags,
			"PROSPECTIVE": true
		}

		console.log("SAVING", student)
		this.props.save(student);

		this.setState({
			banner: {
				active: true,
				good: true,
				text: "Saved!"
			}
		})

		setTimeout(() => {
			this.setState({
				banner: {
					active: false
				},
				redirect: this.isNew() ? `/student?forwardTo=prospective-student` : false
			})
		}, 2000);

	}
	onEnrolled = () => {

		const {"PROSPECTIVE": removed, ...rest } = this.state.profile.tags;

		const student = {
			...this.state.profile,
			Active: true,
			tags:{
				...rest
			}
		}

		this.props.save(student);

		this.setState({
			banner: {
				active: true,
				good: true,
				text: "ENROLLED!"
			}
		})
		
		setTimeout(() => {
			this.setState({
				banner: {
					active: false
				},
				redirect: `/student?forwardTo=prospective-student`
			})
		}, 1000);
	}

	onDelete = () => {
		// console.log(this.state.profile.id)

		this.props.delete(this.state.profile)

		this.setState({
			redirect: `/student?forwardTo=prospective-student`
		})
	}

	componentWillReceiveProps(newProps) {
		// this means every time students upgrades, we will change the fields to whatever was just sent.
		// this means it will be very annoying for someone to edit the user at the same time as someone else
		// which is probably a good thing. 

		this.setState({
			profile: newProps.students[this.props.match.params.id] || this.state.profile
		})
	}

	render() {

		if(this.state.redirect) {
			console.log('redirecting....')
			return <Redirect to={this.state.redirect} />
		}
		console.log(this.props)

		const admin = this.props.user.Admin;

		return <div className="single-student">
				{ this.state.banner.active ? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false }

				<div className="title">Add Prospective Student</div>

				<div className="form">
					<div className="divider">Personal Information</div>
					
					<div className="row">
						<label>Full Name</label>
						<input type="text" {...this.former.super_handle_flex(["Name"], { styles: (val) => { return val === "" ? { borderColor : "#fc6171" } : {} } })} placeholder="Full Name" disabled={!admin} />
					</div>

					<div className="row">
						<label>Gender</label>
						<select {...this.former.super_handle(["Gender"])} disabled={!admin} >
							<option value='' disabled>Please Set a Gender</option>
							<option value="male">Male</option>
							<option value="female">Female</option>
						</select>
					</div>

					<div className="row">
						<label>Father Name</label>
						<input type="text" {...this.former.super_handle(["ManName"])} placeholder="Father Name"  disabled={!admin}/>
					</div>

					<div className="divider">Contact Information</div>

					<div className="row">
						<label>Phone Number</label>
						<input type="tel" {...this.former.super_handle(["Phone"], (num) => num.length <= 11)} placeholder="Phone Number" disabled={!admin}/>
					</div>

					<div className="row">
						<label>Address</label>
						<input type="text" {...this.former.super_handle(["Address"])} placeholder="Address" disabled={!admin}/>
					</div>

					<div className="divider">School Information</div>

					<div className="row">
						<label>Class Section</label>
						<select {...this.former.super_handle_flex(["section_id"], { styles: (val) => { return val === "" ? { borderColor : "#fc6171" } : {} } })} disabled={!admin}>
							{
								 [
									<option key="" value="">Please Select a Section</option>,
									 ...getSectionsFromClasses(this.props.classes)
									 	.sort((a,b) => a.classYear - b.classYear )
										.map(c => <option key={c.id} value={c.id}>{c.namespaced_name}</option>)
								]
							}
						</select>
					</div>
					

					<div className="row">
						<label>Notes</label>
						<textarea {...this.former.super_handle(["Notes"])} placeholder="Notes" disabled={!admin}/>
					</div>

					{ !admin ? false : <div className="save-delete">
						{!this.isNew() ? <div className="button red" onClick={this.onDelete}> Delete </div> : false }
						<div className="button blue" onClick={this.onSave}>Save</div>
					</div>
					}
					<div className="row">
					{!this.isNew() ? <div className="button green" onClick={this.onEnrolled}>Enroll</div> : false }
					</div>
				</div>
			</div>
	}
}

export default connect(state => ({
	students: state.db.students,
	classes: state.db.classes,
	permissions: state.db.settings.permissions,
	user: state.db.faculty[state.auth.faculty_id] }), dispatch => ({ 
	save: (student) => dispatch(createStudentMerge(student)),
	delete: (student) => dispatch(deleteStudent(student)),
 }))(ProspectiveStudent);