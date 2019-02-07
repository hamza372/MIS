import React, { Component } from 'react'
import moment from 'moment';
import { v4 } from 'node-uuid'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom';
import Dynamic from '@ironbay/dynamic'


import { createFacultyMerge, deleteFaculty } from 'actions'
import { hash } from 'utils'
import Hyphenator from 'utils/Hyphenator'



import Banner from 'components/Banner'
import Former from 'utils/former'
import checkCompulsoryFields from 'utils/checkCompulsoryFields'

import './style.css'

// this page will have all the profile info for a teacher.
// all this data will be editable.

const blankTeacher = (isFirst = false) => ({
	Name: "",
	CNIC: "",
	Gender: "",
	Username: "",
	Password: "",
	Married: false,
	Phone: "",
	Salary: "",
	Active: true,

	ManCNIC: "",
	ManName: "",
	Birthdate: "",
	Address: "",
	StructuredQualification: "",
	Qualification: "",
	Experience: "",
	HireDate: moment(),
	Admin: isFirst,

	attendance: { } 
})

// should be a dropdown of choices. not just teacher or admin.

class CreateTeacher extends Component {

	constructor(props) {
		super(props);
		console.log(props)

		const id = props.match.params.id;

		this.state = {
			profile: props.faculty[id] || blankTeacher(this.isFirst()),
			redirect: false,
			banner: {
				active: false,
				good: true,
				text: "Saved!"
			}
		}

		this.former = new Former(this, ["profile"])
	}

	isFirst = () => this.props.match.path.indexOf("first") >= 0
	isNew = () => this.props.location.pathname.indexOf("new") >= 0

	onSave = () => {
		// dispatch merge action, which should come from props.

		const id = v4();

		// check if they set a username and password. 

		const compulsoryFileds = checkCompulsoryFields(this.state.profile, [
			["Name"], 
			["Password"]
		]);
		
		if(compulsoryFileds){

			const errorText = "Please Fill " + compulsoryFileds ;

			return this.setState({
				banner: {
					active: true,
					text: errorText,
					good: false
				}
			})
		}

		if (this.state.profile.Password.length !== 128) { // hack...
			hash(this.state.profile.Password).then(hashed => {
				this.props.save({
					id,
					...this.state.profile,
					Password: hashed
				})

				this.setState({
					banner: {
						active: true,
						good: true,
						text: "Saved!"
					}
				})

				setTimeout(() => {
					this.setState({ 
						redirect: this.isFirst() ? "/login" : (this.isNew() ? `/teacher` : false),

						banner: { active: false }
					})
				}, 1500);

			})
		}
		else {
			this.props.save({
				id,
				...this.state.profile,
			}, this.isFirst())

			this.setState({
				banner: {
					active: true,
					good: true,
					text: "Saved!"
				},
				redirect: this.isNew() ? `/teacher` : false
			})

			setTimeout(() => {
				this.setState({ banner: { active: false }})
			}, 3000);

		}
	}

	onDelete = () => {
		// console.log(this.state.profile.id)

		this.props.delete(this.state.profile.id)

		this.setState({
			banner: {
				active: true,
				good: false,
				text: "Deleted!"
			}
		})

		setTimeout(() => {
			this.setState({
				banner: {
					active: false
				},
				redirect: `/teacher`
			})
		}, 1000);
	}

	componentWillReceiveProps(newProps) {
		// this means every time teacher upgrades, we will change the fields to whatever was just sent.
		// this means it will be very annoying for someone to edit the user at the same time as someone else
		// which is probably a good thing. 

		this.setState({
			profile: newProps.faculty[this.props.match.params.id] || this.state.profile
		})
	}

	addHyphens = (path) => () => {
		
		const str = Dynamic.get(this.state, path);
		this.setState(Dynamic.put(this.state, path, Hyphenator(str)))	
	}


	render() {

		if(this.state.redirect) {
			return <Redirect to={this.state.redirect} />
			//return <Redirect to="/login" />
		}
		/*
				<div className="row">
					<label>Username</label>
					<input type="text" {...this.former.super_handle(["Username"])} placeholder="Username" autoCorrect="off" autoCapitalize="off" />
				</div>
				*/

		const admin = this.isFirst() || this.props.user.Admin;
		const canEdit = admin || this.props.user.id === this.state.profile.id;

		return <div className="single-teacher-create">
			{ this.state.banner.active? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false }

			<div className="form">
				<div className="divider">Personal Information</div>
				<div className="row">
					<label>Full Name</label>
					<input type="text" {...this.former.super_handle_flex(["Name"], { styles: (val) => { return val === "" ? { borderColor : "#fc6171" } : {} } })} placeholder="Full Name" disabled={!canEdit} />
				</div>
				<div className="row">
					<label>CNIC</label>
					<input type="tel" {...this.former.super_handle(["CNIC"], (num) => num.length <= 15,this.addHyphens(["profile","CNIC"]))}  placeholder="CNIC" disabled={!canEdit}/>
				</div>
				<div className="row">
					<label>Gender</label>
					<select {...this.former.super_handle(["Gender"])} disabled={!canEdit}>
						<option value='' disabled>Please Set a Gender</option>
						<option value="male">Male</option>
						<option value="female">Female</option>
					</select>
				</div>
				<div className="row">
					<label>Married</label>
					<select {...this.former.super_handle(["Married"])} disabled={!canEdit}>
						<option value='' disabled>Please Select Marriage Status</option>
						<option value={false}>Not Married</option>
						<option value={true}>Married</option>
					</select>
				</div>

				<div className="row">
					<label>Date of Birth</label>
					<input type="date" 
						onChange={this.former.handle(["Birthdate"])}
						value={moment(this.state.profile.Birthdate).format("YYYY-MM-DD")}
						placeholder="Date of Birth" 
						disabled={!canEdit} />
				</div>

				<div className="row">
					<label>Husband/Father Name</label>
					<input type="text" {...this.former.super_handle(["ManName"])} placeholder="Father/Husband Name" disabled={!canEdit}/>
				</div>

				<div className="row">
					<label>Husband/Father CNIC</label>
					<input type="number" {...this.former.super_handle(["ManCNIC"], num => num.length <= 15, this.addHyphens(["profile","ManCNIC"]))} placeholder="Father/Husband CNIC" disabled={!canEdit}/>
				</div>
				
				<div className="divider">Account Information</div>
				<div className="row">
					<label>Password</label>
					<input type="password" {...this.former.super_handle_flex(["Password"], { styles: (val) => { return val === "" ? { borderColor : "#fc6171" } : {} } })} placeholder="Password" disabled={!canEdit}/>
				</div>

				<div className="divider">Contact Information</div>
				<div className="row">
					<label>Phone Number</label>
					<input type="tel" {...this.former.super_handle(["Phone"], (num) => num.length <= 11 )} placeholder="Phone Number" disabled={!canEdit}/>
				</div>
				<div className="row">
					<label>Address</label>
					<input type="text" {...this.former.super_handle(["Address"])} placeholder="Address" disabled={!canEdit}/>
				</div>

				<div className="divider">School Information</div>
				
				<div className="row">
					<label>Qualification</label>
					<select {...this.former.super_handle(["StructuredQualification"])} disabled={!admin}>
						<option value='' disabled>Please select a Qualification</option>
						<option value='Matric'>Matric</option>
						<option value='Inter'>Intermediate</option>
						<option value='BS'>Bachelors Degree (BS)</option>
						<option value='MS'>Masters Degree (MS)</option>
						<option value='diploma'>Diploma</option>
					</select>
				</div>
				
				<div className="row">
					<label>Other Qualification</label>
					<textarea {...this.former.super_handle(["Qualification"])} placeholder="Qualification" disabled={!admin}/>
				</div>
				
				<div className="row">
					<label>Experience</label>
					<textarea {...this.former.super_handle(["Experience"])} placeholder="Experience" disabled={!admin}/>
				</div>
				
				<div className="row">
					<label>Monthly Salary</label>
					<input type="number" {...this.former.super_handle(["Salary"])} placeholder="Monthly Salary" disabled={!admin}/>
				</div>
				
				<div className="row">
					<label>Joining Date</label>
					<input type="date" onChange={this.former.handle(["HireDate"])} value={moment(this.state.profile.HireDate).format("YYYY-MM-DD")} placeholder="Hire Date" disabled={!admin}/>
				</div>

				<div className="row">
					<label>Admin Status</label>
					<select {...this.former.super_handle(["Admin"])} disabled={!admin}>
						<option value={false}>Not an Admin</option>
						<option value={true}>Admin</option>
					</select>
				</div>

				<div className="row">
					<label>Active Status</label>
					<select {...this.former.super_handle(["Active"])} disabled={!admin}>
						<option value='' disabled>Please Select Active Status</option>
						<option value={true}>Currently Working in School</option>
						<option value={false}>No Longer Working in School</option>
					</select>
				</div>

				{ !admin ? false : <div className="save-delete">
					{ this.isNew() ? false : <div className="button red" onClick={this.onDelete}>Delete</div> }
					<div className="button blue" onClick={this.onSave}>Save</div>
				</div>
				}
			</div>
		</div>
	}
}

export default connect(state => ({ faculty: state.db.faculty, user: state.db.faculty[state.auth.faculty_id] }) , dispatch => ({
	save: (teacher) => dispatch(createFacultyMerge(teacher)),
	delete: (faculty_id) => dispatch(deleteFaculty(faculty_id)) 
 }))(CreateTeacher);