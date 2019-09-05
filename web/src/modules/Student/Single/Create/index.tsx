import React, { Component } from 'react'
import moment from 'moment';
import { v4 } from 'node-uuid'
import { connect } from 'react-redux'
import { Redirect, RouteComponentProps } from 'react-router-dom';
import Dynamic from '@ironbay/dynamic'


import getSectionsFromClasses from '../../../../utils/getSectionsFromClasses'
import { checkStudentDuesReturning } from '../../../../utils/checkStudentDues'

import checkCompulsoryFields from '../../../../utils/checkCompulsoryFields'
import getStudentLimit from '../../../../utils/getStudentLimit'

import Hyphenator from '../../../../utils/Hyphenator'

import { createStudentMerge, deleteStudent } from '../../../../actions'

import Banner from '../../../../components/Banner'
import Former from '../../../../utils/former'

import './style.css'
import { PrintHeader } from '../../../../components/Layout';

// this page will have all the profile info for a student.
// all this data will be editable.

// should come up with reusable form logic. 
// I have an object with a bunch of fields
// text and date input, dropdowns....

const blankStudent = () : MISStudent => ({
	id: v4(),
	Name: "",
	RollNumber: "",
	BForm: "",
	Gender: "",
	Phone: "",
	Fee: 0,
	Active: true,

	ManCNIC: "",
	ManName: "",
	Birthdate: "",
	Address: "",
	Notes: "",
	// @ts-ignore
	StartDate: moment(),
	AdmissionNumber: "",
	BloodType: "",

	fees: {
		[v4()]: {
			name: "Monthly Fee",
			type: "FEE",
			amount: "",
			period: "MONTHLY"  // M: MONTHLY, Y: YEARLY 
		}
	},
	payments: {},
	attendance: {},
	section_id: "",
	tags: {},
	certificates: {},
	prospective_section_id: ""

})
// should be a dropdown of choices. not just teacher or admin.

interface P {
	students: RootDBState['students']
	classes: RootDBState['classes'],
	settings: RootDBState["settings"],
	logo: RootDBState["assets"]["schoolLogo"]
	permissions: RootDBState['settings']['permissions'],
	max_limit: RootDBState['max_limit']
	user: MISTeacher
	save: (student : MISStudent) => any
	delete: (student : MISStudent) => any
}

interface S {
	profile: MISStudent
	redirect: false | string
	banner: {
		active: boolean
		good?: boolean
		text?: string
	}
	new_tag: string
	edit: {
		[id: string]: boolean
	}
}

interface RouteInfo {
	id: string
}

type propTypes = P & RouteComponentProps<RouteInfo>

class SingleStudent extends Component<propTypes, S> {

	former: Former
	constructor(props : propTypes) {
		super(props);

		const id = props.match.params.id;

		const student = props.students[id] ? props.students[id].tags ?
			props.students[id]
			: {
				...props.students[id],
				tags:{}
			} : blankStudent()

		this.state = {
			profile: student,
			redirect: false,
			banner: {
				active: false,
				good: true,
				text: "Saved!"
			},
			new_tag: "",
			edit: {}
		}

		this.former = new Former(this, ["profile"])
	}

	isNew = () => this.props.location.pathname.indexOf("new") >= 0
	isProspective = () => this.props.location.pathname.indexOf("prospective-student") > -1
	
	onFeeEdit = (id: string) => {
		this.setState({
			edit:{
				...this.state.edit,
				[id]: true
			}
		})
	}

	onFeeEditCompletion = (id: string) => {

		const { [id]: removed_edit, ...rest} = this.state.edit

		this.setState({
			edit: rest
		})
	}

	onSave = () => {
		console.log('save!', this.state.profile)
		let student = this.state.profile;

		if( this.isProspective()){
			student = {
				...this.state.profile,
				Active: false,
				fees:{},
				tags:{
					...this.state.profile.tags,
					"PROSPECTIVE": true
				}
			}
		}

		// verify 

		let compulsory_paths = [ ["Name"] ];
		if(student.Active) {
			compulsory_paths.push(["section_id"])
		} else {
			student.section_id = ""
		}

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

		if(!this.isProspective()){

			for(let student of Object.values(this.props.students))
			{
				const RollNumber = student.section_id === this.state.profile.section_id && student.RollNumber !== undefined
					&& student.id !== this.state.profile.id 
					&& student.RollNumber !== "" 
					&& student.RollNumber === this.state.profile.RollNumber

				const AdmissionNumber = student.id !== this.state.profile.id 
					&& student.AdmissionNumber !== undefined 
					&& student.AdmissionNumber !== "" 
					&& student.AdmissionNumber === this.state.profile.AdmissionNumber	

				if(AdmissionNumber || RollNumber)
				{
					return this.setState({
						banner: {
							active : true,
							good: false,
							text: RollNumber ? "Roll Number Already Exists": "Admission Number Already Exists"
						}
					})
				}
			}

			for(let fee of Object.values(this.state.profile.fees)) {
				//console.log('fees', fee)

				if(fee.type === "" || fee.amount === "" || fee.name === "" || fee.period === "") {
					return this.setState({
						banner: {
							active: true,
							good: false,
							text: "Please fill out all Fee Information"
						}
					})
				}
			}

			if(this.isNew()) {
				const payments = checkStudentDuesReturning(student)
					.reduce((agg, p) => ({ 
						...agg, 
						[p.payment_id]: {
							amount: p.amount,
							date: p.date,
							type: p.type,
							fee_id: p.fee_id,
							fee_name: p.fee_name
						}
					}), {});

				student.payments = payments;
			}
			
			for(let p_id of Object.keys(student.payments)) {
				
				const current_payment = student.payments[p_id];
				const corresponding_fees = student.fees[current_payment.fee_id]

				const curr_payment_date = moment(current_payment.date).format("MM/YYYY")
				const curr_month = moment().format("MM/YYYY")
				const fee_amount =  corresponding_fees !== undefined ? parseFloat(corresponding_fees.amount) : 0
				
				if( curr_payment_date === curr_month &&
					current_payment.type === "OWED" &&
					corresponding_fees === undefined) 
				{
					const {[p_id]:removed, ...nextPayment} = student.payments
					student.payments = nextPayment;
				}
				else if(curr_payment_date === curr_month && 
					current_payment.type === "OWED" && 
					corresponding_fees.period === "MONTHLY" &&
					Math.abs(current_payment.amount) !== Math.abs(fee_amount) )
				{
					student.payments[p_id] = {
						amount: corresponding_fees.type !== "SCHOLARSHIP" ?   fee_amount : (-1 * fee_amount), // check if scholarship, then make negative
						date: current_payment.date,
						type: current_payment.type,
						fee_id: current_payment.fee_id,
						fee_name: corresponding_fees.name
					}
				}

			}
		}

		if(!this.isProspective()){
			const { prospective_section_id: removed, ...rest } = student
			this.props.save(rest);
		}
		else{
			this.props.save(student);
		}
		this.setState({
			banner: {
				active: true,
				good: true,
				text: "Saved!"
			},
			edit: {}
		})

		setTimeout(() => {
			this.setState({
				banner: {
					active: false
				},
				redirect: this.isProspective() ? 
					this.isNew() ? `/student?forwardTo=prospective-student` : false 
					: this.isNew() ? `/student` : false
			})
		}, 2000);

	}

	addSibling = (sibling : any) => {
		console.log("ADD SIBLING", sibling)

		// we create another table called "families" with a unique id, and loop and check that map
		// on the student there would be a family id. similar to how we do classes.

		/*
		families: {
			[id]: { 
				name: "",
				students: { [id]: true},
				contact: { phone: number, address: string},
				profile: {
					fathername: "",
					fathercnic: ""
				}
			}
		}

		once added to a family, these fields should also be set on the student profile. if that is the case then it should be above these fields 
		then like a subject, if it's not there they will need to be able to set this 
		*/
	}

	onEnrolled = () => {
		
	const { prospective_section_id : section_id, tags: { "PROSPECTIVE": removed, ...rest_tags }, ...rest_profile } = this.state.profile;
		const student = {
			...rest_profile,
			Active: true,
			section_id,
			tags:{
				...rest_tags
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
		const val = window.confirm("Are you sure you want to delete?")
		if(!val)
			return
		this.props.delete(this.state.profile)

		this.setState({
			redirect: this.isProspective() ? `/student?forwardTo=prospective-student` : `/student`
		})
	}

	addFee = () => {
		const id = v4()
		this.setState({
			profile: {
				...this.state.profile,
				fees: {
					...this.state.profile.fees,
					[id]: {
						name: "",
						type: "FEE", 
						amount: "",
						period: "",
					}
				}
			},
			edit: {
				...this.state.edit,
				[id]: true
			}
		})
	}

	removeFee = (id : string) => () => {

		const val = window.confirm("Are you sure you want to delete?")
		if(!val)
			return

		const {[id]: removed, ...nextFee} = this.state.profile.fees;

		const { [id]: removed_edit, ...rest} = this.state.edit
		this.setState({
			profile: {
				...this.state.profile,
				fees: nextFee
			},
			edit: rest
		})
	}

	componentWillReceiveProps(newProps : propTypes) {
		// this means every time students upgrades, we will change the fields to whatever was just sent.
		// this means it will be very annoying for someone to edit the user at the same time as someone else
		// which is probably a good thing. 

		this.setState({
			profile: newProps.students[this.props.match.params.id] || this.state.profile
		})
	}

	addHyphens = (path : string[]) => () => {
		
		const str = Dynamic.get(this.state, path) as string;
		this.setState(Dynamic.put(this.state, path, Hyphenator(str)) as S)
	}

	uniqueTags = () => {

		const tags = new Set<string>();

		Object.values(this.props.students)
			.filter(s => s.id && s.Name)
			.forEach(s => {
				Object.keys(s.tags || {})
					.forEach(tag => tags.add(tag))
			})

		return tags;
	}

	uniqueFeeName = () => {
		const names = new Set<string>()

		Object.values(this.props.students)
			.filter(s => s.id && s.Name)
			.forEach(s => {
				Object.values(s.fees)
					.forEach(f => names.add(f.name))
			})
			
		return names
	}

	addTag = () => {

		const new_tag = this.state.new_tag;

		if(new_tag.trim() === "") {
			return;
		}

		this.setState({
			profile: {
				...this.state.profile,
				tags: {
					...this.state.profile.tags,
					[new_tag]: true
				}
			}
		})
	}

	removeTag = (tag : string) => () => {

		const {[tag]: removed, ...rest} = this.state.profile.tags;

		this.setState({
			profile: {
				...this.state.profile,
				tags: rest
			}
		})
	}

	removeCertificate = (id: string) => {

		const {[id]: removed, ...rest} = this.state.profile.certificates;

		this.setState({
			profile: {
				...this.state.profile,
				certificates: rest
			}
		})
	}

	render() {

		if(this.state.redirect) {
			console.log('redirecting....')
			return <Redirect to={this.state.redirect} />
		}
		const admin = this.props.user.Admin;
		const {students, max_limit} = this.props;
		const prospective = this.isProspective()

		const { settings, logo } = this.props

		return <div className="single-student">
				{ this.state.banner.active ? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false }
				<PrintHeader settings={settings} logo={logo} />
				<div className="title">Edit Student</div>


				<div className="form">
					<div className="divider">Personal Information</div>
					
					<div className="row">
						<label>Full Name</label>
						<input type="text" 
							{ ...this.former.super_handle_flex(["Name"], { 
									styles: (val : any) => { return val === "" ? { borderColor : "#fc6171" } : {} } 
								})
							} 
							placeholder="Full Name" 
							disabled={!admin} 
						/>
					</div>
					
					{!prospective ? <div className="row">
						<label>B-Form Number</label>
						<input 
							type="tel" {...this.former.super_handle(
								["BForm"],
								(val) => val.length <= 15,
								this.addHyphens(["profile", "BForm"]) )} 
							placeholder="BForm" 
							disabled={!admin} />
					</div> : false}

					{!prospective ? <div className="row">
						<label>Date of Birth</label>
						<input 
							type="date"
							onChange={this.former.handle(["Birthdate"])}
							value={moment(this.state.profile.Birthdate).format("YYYY-MM-DD")}
							placeholder="Date of Birth"
							disabled={!admin} />
					</div> : false}

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

					{!prospective ? <div className="row">
						<label>Father CNIC</label>
						<input 
							type="tel" 
							{...this.former.super_handle(
								["ManCNIC"],
								(num) => num.length <= 15,
								this.addHyphens(["profile", "ManCNIC"]))
							} 
							placeholder="Father CNIC" 
							disabled={!admin} />
					</div>: false}

					<div className="row">
						<label>Blood Type</label>
						<select {...this.former.super_handle(["BloodType"])}>
							<option value="">Select Blood Type</option>
							<option value="A+">A Positive</option>
							<option value="A-">A Negative</option>
							<option value="B+">B Positive</option>
							<option value="B-">B Negative</option>
							<option value="AB+">AB Positive</option>
							<option value="AB-">AB Negative</option>
							<option value="O+">O Positive</option>
							<option value="O-">O Negative</option>
						</select>
					</div>


					<div className="divider">Contact Information</div>

					<div className="row">
						<label>Phone Number</label>
						<div className="row" style={{ flexDirection:"row" }}>
							<input 
								style={{ width:"100%" }}
								type="tel"
								{...this.former.super_handle(["Phone"], (num) => num.length <= 11)}
								placeholder="Phone Number" 
								disabled={!admin}
							/>
							{!this.isNew() && <a className="button blue call-link" href={`tel:${this.state.profile.Phone}`} > Call</a>}
						</div>
					</div>

					{!prospective ? <div className="row">
						<label>Address</label>
						<input type="text" {...this.former.super_handle(["Address"])} placeholder="Address" disabled={!admin}/>
					</div> : false }

					<div className="divider">School Information</div>

					{!prospective ? <div className="row">
						<label>Active Status</label>
						<select {...this.former.super_handle(["Active"])} disabled={!admin}>
							<option value="true">Student Currently goes to this School</option>
							<option value="false">Student No Longer goes to this School</option>
						</select>
					</div> : false}

					{ prospective || !this.state.profile.Active ? false : <div className="row">
						<label>Class Section</label>
						<select 
							{...this.former.super_handle_flex(
								["section_id"], 
								{ styles: (val : string) => val === "" ? { borderColor : "#fc6171" } : {} })
							} 
							disabled={!admin}>

							<option value="">Please Select a Section</option>
							{
								getSectionsFromClasses(this.props.classes)
									.sort((a,b) => a.classYear - b.classYear )
									.map(c => <option key={c.id} value={c.id}>{c.namespaced_name}</option>)
							}
						</select>
					</div>
					}
					{ !prospective ? false : <div className="row">
						<label>Class Section</label>
						<select 
							{...this.former.super_handle_flex(
								["prospective_section_id"], 
								{ styles: (val : string) => val === "" ? { borderColor : "#fc6171" } : {} }
							)} 
							disabled={!admin}>

								<option value="">Please Select a Section</option>
								{
									getSectionsFromClasses(this.props.classes)
										.sort((a,b) => a.classYear - b.classYear )
										.map(c => <option key={c.id} value={c.id}>{c.namespaced_name}</option>)
								}
						</select>
					</div>
					}

					{!prospective ? <div className="row">
						<label>Roll No</label>
						<input 
							type="text" 
							{...this.former.super_handle(["RollNumber"])}
							placeholder="Roll Number" disabled={!admin} 
						/>
					</div>: false}

					{!prospective ? <div className="row">
						<label>Admission Date</label>
						<input type="date" 
							onChange={this.former.handle(["StartDate"])} 
							value={moment(this.state.profile.StartDate).format("YYYY-MM-DD")} 
							placeholder="Admission Date" 
							disabled={!admin}
						/>
					</div> : false}

					{!prospective ? <div className="row">
						<label>Admission Number</label>
						<input type="text" {...this.former.super_handle(["AdmissionNumber"])} placeholder="Admission Number" disabled={!admin}/>
					</div> : false}

					<div className="row">
						<label>Notes</label>
						<textarea {...this.former.super_handle(["Notes"])} placeholder="Notes" disabled={!admin}/>
					</div>

					{!prospective && <div className="divider"> Tags </div>}
					{!prospective && <div className="tag-container">
						{
							Object.keys(this.state.profile.tags)
							.map(tag =>
								<div className="tag-row" key={tag}>
									<div className="deletable-tag-wrapper" onClick={this.removeTag(tag)}>
										<div className="tag">{tag} </div> 
										<div className="cross">×</div>
									</div>
								</div>
							)
						}
					</div>}

					{!prospective && <div className="row" style={{flexDirection:"row"}}>
						<input list="tags" onChange={(e) => this.setState({ new_tag: e.target.value })} placeholder="Type or Select Tag" style={{width: "initial"}}/>
						<datalist id="tags">
						{
							[...this.uniqueTags().keys()]
							.filter(tag => tag !== "FINISHED_SCHOOL" && tag !== "PROSPECTIVE")
							.map(tag => <option key={tag} value={tag} />)
						}
						</datalist>
						<div className="button green" style={{ width: "initial", marginLeft:"auto" }} onClick={this.addTag}>+</div>
					</div>}

					{!prospective && <div className="divider"> Certificates </div>}
					{!prospective && <div>
					{
						Object.entries(this.state.profile.certificates || {})
							.map(([c_id, cert_info]) => {
								return <div className="row" key={c_id}>
									<label>{`${cert_info.type}-${moment(cert_info.date).format("DD-MM-YY")}`}</label>
									<div className="button red" onClick={() => this.removeCertificate(c_id)}>x</div>
								</div>
							})
					}
					</div>}

					{(admin || this.props.permissions.fee.teacher) && !prospective ? <div className="divider">Payment</div> : false }
					{(admin || this.props.permissions.fee.teacher) && !prospective ?
						Object.entries(this.state.profile.fees).map(([id, fee]) => {
							const editable = this.state.edit[id] || this.isNew()

							return <div className="section" key={id}>
								{!admin || editable ? false : <div className="click-label" onClick={() => this.onFeeEdit(id)}>Edit Fee</div>}
								{!admin || !editable ? false : <div className="click-label" onClick={this.removeFee(id)}>Remove Fee</div>}
								<div className="row">
									<label>Type</label>
									<select {...this.former.super_handle(["fees", id, "type"])} disabled={!admin || !editable}>
										<option value="" disabled>Select Fee or Scholarship</option>
										<option value="FEE">Fee</option>
										<option value="SCHOLARSHIP">Scholarship</option>
									</select>
								</div>
								<datalist id="fee_names">
									{
										[...this.uniqueFeeName().keys()]
										.map(n => <option key={n} value={n} />)
									}
								</datalist>
								<div className="row">
									<label>Name</label>
									<input 
										list="fee_names"
										type="text"
										{...this.former.super_handle(["fees", id, "name"])}
										placeholder={this.state.profile.fees[id].type === "SCHOLARSHIP" ? "Scholarship Name" : "Fee Name"}
										disabled={!admin || !editable }
									/>
								</div>
								<div className="row">
									<label>Amount</label>
									<input type="number" {...this.former.super_handle_flex(
											["fees", id, "amount"],
											{ styles: (val : string) => val === "" ? { borderColor : "#fc6171" } : {} })
										}
										placeholder="Amount"
										disabled={!admin || !editable}/>
								</div>
								<div className="row">
									<label>Fee Period</label>
									<select {...this.former.super_handle(["fees", id, "period"])} disabled={!admin || !editable}>
										<option value="" disabled>Please Select a Time Period</option>
										<option value="SINGLE">One Time</option>
										<option value="MONTHLY">Every Month</option>
									</select>
								</div>
								{!admin || !editable ? false : <div className="button green" onClick={() => this.onFeeEditCompletion(id)}> Done </div>}
							</div>
						})
					: false }
					{ admin && !prospective ? <div className="button green" onClick={this.addFee}>Add Additional Fee or Scholarship</div> : false }
					{ !admin ? false : <div className="save-delete">
						{!this.isNew()? <div className="button red" onClick={this.onDelete}>Delete</div> : false}
						<div className="button blue" onClick={this.onSave}>Save</div>
					</div>
					}
					<div className="row">
					{prospective && !this.isNew() && !getStudentLimit(students, max_limit) ? <div className="button green" onClick={this.onEnrolled}>Enroll</div> : false}
						<div className="button blue" onClick={() => window.print()}> Print</div>
					</div>
				</div>
			</div>
	}
}

export default connect((state : RootReducerState) => ({
	students: state.db.students,
	classes: state.db.classes,
	settings: state.db.settings,
	logo: state.db.assets ? state.db.assets.schoolLogo || "" : "",
	permissions: state.db.settings.permissions,
	max_limit: state.db.max_limit || -1 ,
	user: state.db.faculty[state.auth.faculty_id] }), (dispatch : Function) => ({ 
	save: (student : MISStudent) => dispatch(createStudentMerge(student)),
	delete: (student : MISStudent) => dispatch(deleteStudent(student)),
 }))(SingleStudent);