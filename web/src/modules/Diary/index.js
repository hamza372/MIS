import React, { Component } from 'react'
import Layout from 'components/Layout'
import {PrintHeader} from 'components/Layout'
import {connect} from 'react-redux'
import { sendSMS, sendBatchSMS } from 'actions/core'
import { logSms, addDiary } from 'actions'
import Banner from 'components/Banner'
import { smsIntentLink } from 'utils/intent'
import {getSectionsFromClasses} from 'utils/getSectionsFromClasses';
import former from 'utils/former'
import moment from 'moment'

/** Structure of Diary
 * diary:{
 *    section_id:{
 *        subject: { homework: ""},
 *        ...
 *    },
 *    ...
 * }
 */
	  
class Diary extends Component {
	constructor(props) {
		super(props)

		const curr_date = moment().format("DD/MM/YYYY")
		const diary = Object.values(this.props.classes)
			.reduce((agg, c) => {
				
				const sectionObj =  Object.keys(c.subjects)
					.reduce((agg,s) => {
						return {
							...agg,
							[s]: { 
								homework:""
							}
						}
					}, {})

				const obj = Object.keys(c.sections)
					.reduce((agg,sec_id) => {
						return {
							...agg,
							[sec_id] : sectionObj
						}
					}, {})

				return {...agg, ...obj}
			}, {})

		this.state = {
			banner: {
				active: false,
				good: true,
				text: "Saved!"
			},
			selected_section_id: "",
			students_filter: "all_students",
			diary: props.diary && moment(props.diary.date).format("DD/MM/YYYY") === curr_date ? JSON.parse(JSON.stringify(props.diary)) : diary
		}

		this.former = new former(this, [])
	}
	
	logSms = (messages) => {

		if(messages.length === 0){
			console.log("No Messaged to Log")
			return
		}

		const historyObj = {
			faculty: this.props.faculty_id,
			date: new Date().getTime(),
			type: "DIARY",
			count: messages.length,
		}

		this.props.logSms(historyObj)
	}

	componentWillReceiveProps(newProps) {

		const curr_date = moment().format("DD/MM/YYYY")

		this.setState({
			diary: newProps.diary && moment(newProps.diary.date).format("DD/MM/YYYY") === curr_date ? JSON.parse(JSON.stringify(newProps.diary)) : JSON.parse(JSON.stringify(this.props.diary))
		})
	}

	onSave = () => {
		//Here need to send subjects rather then the whole section's diary

		const diary = Object.entries(this.state.diary[this.state.selected_section_id] || {})
			.filter(([subject, d]) => 
				(this.props.diary === undefined) || 
				(this.props.diary[this.state.selected_section_id] === undefined) ||
				(this.props.diary[this.state.selected_section_id][subject] === undefined) ||
				d.homework !== this.props.diary[this.state.selected_section_id][subject].homework
			)
			.reduce((agg, [s, diary]) => {

				return {
					...agg,
					[s]: diary
				}

			}, {})

		if(diary === undefined) {
			this.setState({
				banner: {
					active: true,
					good: false,
					text: "No Diary Saved"
				}
			})

			setTimeout(() => {
				this.setState({
					banner: {
						active: false
					}
				})
			}, 1000);

			return;
		}

		this.props.addDiary(diary, this.state.selected_section_id)

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
				}
			})
		}, 1000);
	}
	
	diaryString = () => {
		
		if(this.state.selected_section_id === "" || this.state.diary[this.state.selected_section_id] === undefined ){
			console.log("Not running diary")
			return []
		}
		const curr_date = `Date: ${moment().format("DD MMMM YYYY")}\n`
		
		const diary_message = Object.entries(this.state.diary[this.state.selected_section_id])
				.map( ([ subject, { homework }]) => {
					return `${subject}: ${homework}`
			})
		return curr_date + diary_message.join("\n")
	}

	render() {

		const { classes, students, sendBatchMessages, settings, schoolLogo } = this.props;

		const sortedSections = getSectionsFromClasses(classes).sort((a, b) => (a.classYear || 0) - (b.classYear || 0));

		const subjects = new Set()
		
		for(let c of Object.values(classes)){
			if(this.state.selected_section_id !== "" && c.sections[this.state.selected_section_id] !== undefined){
				Object.keys(c.subjects).forEach(s => subjects.add(s))
			}
		}

		let students_arr = new Array()
		
		if(this.state.students_filter === "all_students") {
			students_arr = Object.values(students)
		}
		else if(this.state.students_filter === "absent_students") {
			students_arr = Object.values(students).filter( s => {
				const curr_attendance = s.attendance[moment(this.state.date).format("YYYY-MM-DD")] 
				
				// if today's attendance not marked
				if(curr_attendance === undefined)
					return false

				return s.section_id === this.state.selected_section_id && curr_attendance.status === "ABSENT"
			})
		}
		else if(this.state.students_filter === "leave_students") {
			students_arr = Object.values(students).filter( s => {
				const curr_attendance = s.attendance[moment(this.state.date).format("YYYY-MM-DD")];		
				
				// if today's attendance not marked				
				if(curr_attendance === undefined)
					return false

				return s.section_id === this.state.selected_section_id && curr_attendance &&
					    (curr_attendance.status === "LEAVE" || curr_attendance.status === "SHORT_LEAVE" || 
					   curr_attendance.status === "SICK_LEAVE" || curr_attendance.status === "CASUAL_LEAVE")
			})
		}
		
		const messages = students_arr
			.filter(s => s.section_id === this.state.selected_section_id && (s.tags === undefined || !s.tags["PROSPECTIVE"]) && s.Phone !== undefined && s.Phone !== "")
			.reduce((agg,student)=> {

				const index  = agg.findIndex(s => s.number === student.Phone)

				if(index >= 0 ){
					return agg
				}

				const diary_string = this.diaryString()

				return [ 
					...agg,
					{
						number: student.Phone,
						text : diary_string
					}
				]
			}, [])

	return <Layout history={this.props.history}>
		<div className="sms-page">
		<PrintHeader settings={settings} logo={schoolLogo}/>
		
			{ this.state.banner.active ? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false }

			<div className="title">Diary</div>
				<div className="form">
					<div className="no-print divider">Send Diary for {moment().format("DD-MMMM-YYYY")}</div>
					<div className="print-only row"><b>Date:</b> {moment().format("DD-MMMM-YYYY")}</div>
					<div className="section">
						<div className="row">
							<label>Select Class/Section</label>
							<select {...this.former.super_handle(["selected_section_id"])}>
								<option value="" disabled>Select Section</option>
								{
									sortedSections.map( s => <option key={s.id} value={s.id}>{s.namespaced_name}</option>)	
								}
							</select>
						</div>
						{
							this.state.selected_section_id !== "" && <div className="no-print row">
								<label>Send diary to</label>
								<select {...this.former.super_handle(["students_filter"])}>
									<option value="" disabled>Select Students</option>
									<option value="all_students"> All students</option>
									<option value="absent_students"> Only Absent students</option>
									<option value="leave_students"> Only Leave students</option>
								</select>
							</div>
						}
					</div>
				{ 
					this.state.selected_section_id !== "" && <div className="section">
						{
							Array.from(subjects)
								.map(s => <div className="table row" key={`${this.state.selected_section_id}-${s}`}>
									<div>{s}</div>
									<input 
										type="text"
										style={{textAlign: "left"}} 
										{...this.former.super_handle(["diary", this.state.selected_section_id, s, "homework"])}
										placeholder="Enter Homework" />
								</div>)
						}

						{ subjects.size > 0 && <div className="button blue" onClick={this.onSave}>Save</div> }

					</div>
				}

				{
					subjects.size === 0 ? false : settings.sendSMSOption === "SIM" ?
						<div className ="row"> 
						<a 
							className="button blue"
							href={smsIntentLink({
								messages,
								return_link: window.location.href 
							})}
							onClick={() => this.logSms(messages)}>
							Send using Local SIM </a>
							<div className="button" onClick={() => window.print()}>Print</div>
						</div>
							 :
						<div className="button" onClick={() => sendBatchMessages(messages)} style={{width: "20%"}}>Send</div>
				}
				
			</div>
			
			<div className="print-only">
				<div className="row" style={{ marginTop: "20px" }}>
					<div>Teacher Signature: ___________________</div>
				</div>
				<div className="row" style={{ marginTop: "20px", marginBottom:"40px" }}>
					<div>Parents Signature: ___________________</div>
				</div>
			</div>
		</div>
	</Layout>
  }
}
export default connect(state => ({
	faculty_id: state.auth.faculty_id,
	diary: state.db.diary,
	students: state.db.students,
	classes: state.db.classes,
	settings: state.db.settings,
	schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : "", 
}), dispatch => ({
	sendMessage : (text, number) => dispatch(sendSMS(text, number)),
	sendBatchMessages: (messages ) => dispatch(sendBatchSMS(messages)),
	logSms: (faculty_id, history) => dispatch(logSms(faculty_id, history)),
	addDiary: (section_diary, section_id) => dispatch(addDiary(section_diary, section_id))
	}))(Diary);