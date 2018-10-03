import React, { Component } from 'react'
import moment from 'moment';
import { v4 } from 'node-uuid'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom';

import { createFacultyMerge } from 'actions'
import { hash } from 'utils'

import Banner from 'components/Banner'
import Former from 'utils/former'

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
	Salary: 0,
	Active: true,

	ManCNIC: "",
	ManName: "",
	Birthdate: moment().subtract(20, "year"),
	Address: "",
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

		if(this.state.profile.Username === "" || this.state.profile.Password === "") {
			return this.setState({
				banner: {
					active: true,
					text: "Please Fill Account Information",
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
					redirect: this.isFirst() ? "/login" : (this.isNew() ? `/faculty/${id}/profile` : false),
					banner: {
						active: true,
						good: true,
						text: "Saved!"
					}
				})

				setTimeout(() => {
					this.setState({ banner: { active: false }})
				}, 3000);

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
				redirect: this.isNew() ? `/faculty/${id}/profile` : false
			})

			setTimeout(() => {
				this.setState({ banner: { active: false }})
			}, 3000);

		}
	}

	render() {

		if(this.state.redirect) {
			return <Redirect to={this.state.redirect} />
			//return <Redirect to="/login" />
		}

		return <div className="single-teacher-create">
			{ this.state.banner.active? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false }

			<div className="form">
				<div className="divider">Personal Information</div>
				<div className="row">
					<label>Full Name</label>
					<input type="text" {...this.former.super_handle(["Name"])} placeholder="Full Name" />
				</div>
				<div className="row">
					<label>CNIC</label>
					<input type="text" {...this.former.super_handle(["CNIC"], (num) => num.length <= 13)} placeholder="CNIC" />
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
					<label>Married</label>
					<select {...this.former.super_handle(["Married"])}>
						<option value='' disabled>Please Select Marriage Status</option>
						<option value={false}>Not Married</option>
						<option value={true}>Married</option>
					</select>
				</div>

				<div className="row">
					<label>Date of Birth</label>
					<input type="date" onChange={this.former.handle(["Birthdate"])} value={moment(this.state.profile.Birthdate).format("YYYY-MM-DD")} placeholder="Date of Birth" />
				</div>

				<div className="row">
					<label>Husband/Father Name</label>
					<input type="text" {...this.former.super_handle(["ManName"])} placeholder="Father/Husband Name" />
				</div>

				<div className="row">
					<label>Husband/Father CNIC</label>
					<input type="number" {...this.former.super_handle(["ManCNIC"], num => num.length <= 13)} placeholder="Father/Husband CNIC" />
				</div>
				
				<div className="divider">Account Information</div>
				<div className="row">
					<label>Username</label>
					<input type="text" {...this.former.super_handle(["Username"])} placeholder="Username" autoCorrect="off" autoCapitalize="off" />
				</div>
				<div className="row">
					<label>Password</label>
					<input type="password" {...this.former.super_handle(["Password"])} placeholder="Password" />
				</div>

				<div className="divider">Contact Information</div>
				<div className="row">
					<label>Phone Number</label>
					<input type="tel" {...this.former.super_handle(["Phone"], (num) => num.length <= 11 )} placeholder="Phone Number" />
				</div>
				<div className="row">
					<label>Address</label>
					<input type="text" {...this.former.super_handle(["Address"])} placeholder="Address" />
				</div>

				<div className="divider">School Information</div>
				<div className="row">
					<label>Monthly Salary</label>
					<input type="number" {...this.former.super_handle(["Salary"])} placeholder="Monthly Salary"/>
				</div>

				<div className="row">
					<label>Experience</label>
					<textarea {...this.former.super_handle(["Experience"])} placeholder="Experience" />
				</div>
				<div className="row">
					<label>Qualification</label>
					<textarea {...this.former.super_handle(["Qualification"])} placeholder="Qualification" />
				</div>

				<div className="row">
					<label>Start Date</label>
					<input type="date" onChange={this.former.handle(["HireDate"])} value={moment(this.state.profile.HireDate).format("YYYY-MM-DD")} placeholder="Hire Date"/>
				</div>

				<div className="row">
					<label>Admin Status</label>
					<select {...this.former.super_handle(["Admin"])} disabled={!this.props.user.Admin}>
						<option value={false}>Not an Admin</option>
						<option value={true}>Admin</option>
					</select>
				</div>

				<div className="row">
					<label>Active Status</label>
					<select {...this.former.super_handle(["Active"])}>
						<option value='' disabled>Please Select Active Status</option>
						<option value={true}>Currently Working at School</option>
						<option value={false}>No Longer Working at School</option>
					</select>
				</div>

				<div className="save button" onClick={this.onSave}>Save</div>
			</div>
		</div>
	}
}

export default connect(state => ({ faculty: state.db.faculty, user: state.db.faculty[state.auth.faculty_id] }) , dispatch => ({
	save: (teacher) => dispatch(createFacultyMerge(teacher)) 
 }))(CreateTeacher);