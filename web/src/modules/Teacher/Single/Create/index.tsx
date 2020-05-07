import React, { Component } from 'react'
import moment from 'moment'
import { v4 } from 'node-uuid'
import { connect } from 'react-redux'
import { Redirect, RouteComponentProps } from 'react-router-dom'
import Dynamic from '@cerp/dynamic'
import Former from 'utils/former'


import { createFacultyMerge, deleteFaculty } from 'actions'
import { hash } from 'utils'
import Hyphenator from 'utils/Hyphenator'
import Banner from 'components/Banner'
import checkCompulsoryFields from 'utils/checkCompulsoryFields'
import { StudentIcon } from 'assets/icons'

import './style.css'
import Modal from 'components/Modal'
import FacultyProfilePictureModal from './Modals/profilePictureModal'

const blankTeacher = (isFirst = false): MISTeacher => ({
	id: v4(),
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
	HireDate: moment().format("MM-DD-YYYY"),
	Admin: isFirst,
	HasLogin: true,
	tags: {},
	attendance: {}
})

interface P {
	faculty: RootDBState['faculty']
	user: MISTeacher
	save: (teacher: MISTeacher) => any
	delete: (faculty_id: string) => any
}

interface S {
	profile: MISTeacher
	redirect: false | string
	banner: {
		active: boolean
		good?: boolean
		text?: string
	}
	tag: string
	showProfilePictureModal: boolean
}

interface RouteInfo {
	id: string
}

type propTypes = P & RouteComponentProps<RouteInfo>

class CreateTeacher extends Component<propTypes, S> {

	former: Former

	constructor(props: propTypes) {
		super(props)

		const id = props.match.params.id
		const faculty = props.faculty[id]

		this.state = {
			profile: {
				...faculty || blankTeacher(this.isFirst()),
				HasLogin: faculty && faculty.HasLogin ? faculty.HasLogin : true
			},
			redirect: false,
			banner: {
				active: false,
				good: true,
				text: "Saved!"
			},
			tag: "",
			showProfilePictureModal: false
		}

		this.former = new Former(this, ["profile"])
	}

	isFirst = () => this.props.match.path.indexOf("first") >= 0
	isNew = () => this.props.location.pathname.indexOf("new") >= 0

	onSave = () => {

		const compulsoryFileds = checkCompulsoryFields(this.state.profile, [
			["Name"]
		])

		if (compulsoryFileds) {

			const errorText = "Please Fill " + compulsoryFileds

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
				}, 1500)

			})
		}
		else {
			this.props.save(this.state.profile)

			this.setState({
				banner: {
					active: true,
					good: true,
					text: "Saved!"
				},
				redirect: this.isNew() ? `/teacher` : false
			})

			setTimeout(() => {
				this.setState({ banner: { active: false } })
			}, 3000)

		}
	}

	onDelete = () => {

		const val = window.confirm("Are you sure you want to delete?")
		if (!val)
			return
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
		}, 1000)
	}

	UNSAFE_componentWillReceiveProps(newProps: propTypes) {
		// this means every time teacher upgrades, we will change the fields to whatever was just sent.
		// this means it will be very annoying for someone to edit the user at the same time as someone else
		// which is probably a good thing. 

		this.setState({
			profile: newProps.faculty[this.props.match.params.id] || this.state.profile
		})
	}

	addHyphens = (path: string[]) => () => {

		const str = Dynamic.get(this.state, path) as string
		this.setState(Dynamic.put(this.state, path, Hyphenator(str)) as S)
	}

	addTag = () => {

		const { tag, profile } = this.state

		if (tag.trim() === "") {
			return
		}

		this.setState({
			profile: {
				...profile,
				tags: {
					...(profile.tags || {}),
					[tag.trim()]: true
				}
			}
		})
	}

	removeTag = (tag: string) => () => {

		const { profile } = this.state
		const { [tag]: removed, ...rest } = profile.tags

		this.setState({
			profile: {
				...profile,
				tags: rest
			}
		})
	}

	getUniqueTagsFromFaculty = (): Array<string> => {

		const tags = new Set<string>()

		Object.values(this.props.faculty || {})
			.filter(f => f.id && f.Name)
			.forEach(s => {
				Object.keys(s.tags || {})
					.forEach(tag => tags.add(tag))
			})

		return [...tags]
	}

	toggleProfilePictureModal = () => {
		this.setState({
			showProfilePictureModal: !this.state.showProfilePictureModal
		})
	}

	closeProfilePictureModal = () => {
		this.setState({
			showProfilePictureModal: false
		})
	}

	render() {

		if (this.state.redirect) {
			return <Redirect to={this.state.redirect} />
		}

		const admin = this.isFirst() || this.props.user.Admin
		const canEdit = admin || this.props.user.id === this.state.profile.id

		return <div className="single-teacher-create">
			{this.state.banner.active ? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false}

			{this.state.showProfilePictureModal && <Modal>
				<FacultyProfilePictureModal onClose={this.closeProfilePictureModal} />
			</Modal>
			}
			<div className="form">
				<fieldset>
					<legend>Personal Information</legend>
					<div className="profile-picture-wrapper">
						<label>Profile Picture</label>
						<div>
							<div className="picture text-center" onClick={this.toggleProfilePictureModal}>
								<img src={StudentIcon} alt="avatar" />
							</div>
							<button className="button blue" onClick={this.toggleProfilePictureModal}>Update</button>
						</div>
					</div>
					<div className="row">
						<label>Full Name</label>
						<input type="text" {...this.former.super_handle_flex(["Name"], { styles: (val: string) => { return val === "" ? { borderColor: "#fc6171" } : {} } })} placeholder="Full Name" disabled={!canEdit} />
					</div>
					<div className="row">
						<label>CNIC</label>
						<input type="tel" {...this.former.super_handle(["CNIC"], (num) => num.length <= 15, this.addHyphens(["profile", "CNIC"]))} placeholder="CNIC" disabled={!canEdit} />
					</div>
					<div className="row">
						<label>Husband/Father CNIC</label>
						<input type="tel" {...this.former.super_handle(["ManCNIC"], num => num.length <= 15, this.addHyphens(["profile", "ManCNIC"]))} placeholder="Father/Husband CNIC" disabled={!canEdit} />
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
						<label>Date of Birth</label>
						<input type="date"
							onChange={this.former.handle(["Birthdate"])}
							value={moment(this.state.profile.Birthdate).format("YYYY-MM-DD")}
							placeholder="Date of Birth"
							disabled={!canEdit} />
					</div>
					<div className="row">
						<label>Married</label>
						<select {...this.former.super_handle(["Married"])} disabled={!canEdit}>
							<option value='' disabled>Please Select Marriage Status</option>
							<option value="false">Not Married</option>
							<option value="true">Married</option>
						</select>
					</div>
					<div className="row">
						<label>Phone No.</label>
						<input type="tel" {...this.former.super_handle(["Phone"], (num) => num.length <= 15)} placeholder="Phone Number" disabled={!canEdit} />
					</div>
					<div className="row">
						<label>Home Address</label>
						<input type="text" {...this.former.super_handle(["Address"])} placeholder="Address" disabled={!canEdit} />
					</div>
				</fieldset>

				<fieldset>
					<legend>Account Login Information</legend>
					<div className="row">
						<label>Admin Status</label>
						<select {...this.former.super_handle(["Admin"])} disabled={!admin}>
							<option value="true">Admin</option>
							<option value="false">Not an Admin</option>
						</select>
					</div>
					<div className="row">
						<label>User status</label>
						<select {...this.former.super_handle(["HasLogin"])} disabled={!admin}>
							<option value="true">Has login access</option>
							<option value="false">Does not have login access</option>
						</select>
					</div>
					<div className="row">
						<label>Password</label>
						<input type="password" {...this.former.super_handle_flex(["Password"], { styles: (val: string) => { return val === "" ? { borderColor: "#fc6171" } : {} } })} placeholder="Password" disabled={!canEdit} />
					</div>
				</fieldset>

				<fieldset>
					<legend>School Information</legend>
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
						<textarea {...this.former.super_handle(["Qualification"])} placeholder="Qualification" disabled={!admin} />
					</div>

					<div className="row">
						<label>Experience</label>
						<textarea {...this.former.super_handle(["Experience"])} placeholder="Experience" disabled={!admin} />
					</div>

					<div className="row">
						<label>Monthly Salary</label>
						<input type="number" {...this.former.super_handle(["Salary"])} placeholder="Monthly Salary" disabled={!admin} />
					</div>

					<div className="row">
						<label>Joining Date</label>
						<input type="date" onChange={this.former.handle(["HireDate"])} value={moment(this.state.profile.HireDate).format("YYYY-MM-DD")} placeholder="Hire Date" disabled={!admin} />
					</div>

					<div className="row">
						<label>Active Status</label>
						<select {...this.former.super_handle(["Active"])} disabled={!admin}>
							<option value='' disabled>Please Select Active Status</option>
							<option value="true">Currently Working in School</option>
							<option value="false">No Longer Working in School</option>
						</select>
					</div>
				</fieldset>

				<fieldset>
					<legend>Tags</legend>
					<div className="tag-container">
						{
							Object.keys(this.state.profile.tags || {})
								.map(tag =>
									<div className="tag-row" key={tag}>
										<div className="deletable-tag-wrapper" onClick={this.removeTag(tag)}>
											<div className="tag">{tag} </div>
											<div className="cross">×</div>
										</div>
									</div>
								)
						}
					</div>

					<div className="row" style={{ flexDirection: "row" }}>
						<input list="tags" onChange={(e) => this.setState({ tag: e.target.value })} placeholder="Type or Select Tag" style={{ width: "initial" }} />
						<datalist id="tags">
							{
								this.getUniqueTagsFromFaculty()
									.map(tag => <option key={tag} value={tag} />)
							}
						</datalist>
						<div className="button green" style={{ width: "initial", marginLeft: "auto" }} onClick={this.addTag}>+</div>
					</div>
				</fieldset>

				{!admin ? false : <div className="save-delete">
					{this.isNew() ? false : <div className="button red" onClick={this.onDelete}>Delete</div>}
					<div className="button blue" onClick={this.onSave}>Save</div>
				</div>
				}

			</div>
		</div>
	}
}

export default connect((state: RootReducerState) => ({
	faculty: state.db.faculty,
	user: state.db.faculty[state.auth.faculty_id]
}), (dispatch: Function) => ({
	save: (teacher: MISTeacher) => dispatch(createFacultyMerge(teacher)),
	delete: (faculty_id: string) => dispatch(deleteFaculty(faculty_id))
}))(CreateTeacher)