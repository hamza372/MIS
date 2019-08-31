import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link, RouteComponentProps } from 'react-router-dom'

import getSectionsFromClasses from '../../utils/getSectionsFromClasses'

import { smsIntentLink } from '../../utils/intent'
import Layout from '../../components/Layout'
import { markStudent, logSms } from '../../actions'

import moment from 'moment'
import Former from '../../utils/former'

import './style.css'

interface P {
	current_faculty: MISTeacher
	students: RootDBState["students"]
	classes: RootDBState["classes"]
	settings: RootDBState["settings"]
	connected: RootReducerState["connected"]
	attendance_message_template: RootDBState["sms_templates"]["attendance"]
	markStudent: (student: MISStudent, date: string, status: MISStudentAttendanceEntry["status"]) => any
	logSms: (history: any) => any
}

interface S {
	date: number
	sending: boolean
	selected_section: string
	selected_students: { [id: string]: boolean }
}

interface RouteInfo {
	id: string
}

type propTypes = P & RouteComponentProps<RouteInfo>

const deriveSelectedStudents = (selected_section: string, students: RootDBState["students"]) =>  getStudentsForSection(selected_section, students)
	.reduce((agg, curr) => ({...agg, [curr.id]: true}), {})

const getStudentsForSection = (section_id: string, students: RootDBState["students"]) => Object.values(students)
	.filter(s => s.section_id === section_id)

class Attendance extends Component <propTypes, S> {

	Former: Former
	constructor(props : propTypes) {
		super(props);

		// by default, the class selected should be one owned by the user.

		const sections = getSectionsFromClasses(props.classes)

		const my_sections = sections.filter(s => s.faculty_id === props.current_faculty.id)

		const selected_section = my_sections.length > 0 ? my_sections[0].id : (sections.length > 0 ? sections[0].id : "");

		this.state = {
			date: moment.now(),
			sending: false,
			selected_section,
			selected_students: deriveSelectedStudents(selected_section, props.students)
		}

		this.Former = new Former(this, [])
	}

	mark = (student: MISStudent, status: MISStudentAttendanceEntry["status"]) => () => {
		this.props.markStudent(student, moment(this.state.date).format("YYYY-MM-DD"), status);
	}

	sendBatchSMS = (messages : MISSms[]) => {
		if(messages.length === 0){
			console.log("No Messages to Log")
			return
		}
		const historyObj = {
			faculty: this.props.current_faculty.id,
			date: new Date().getTime(),
			type: "ATTENDANCE",
			count: messages.length,
		}

		this.props.logSms(historyObj)
		
		this.setState({
			sending: true
		})

		setTimeout(() => {
			this.setState({
				sending: false
			})
		}, 2000);

	}

	selectAllOrNone = () => {

		const all_selected = Object.values(this.state.selected_students).every(x => x);

		if(all_selected) {
			// set all to false
			this.setState({
				selected_students: Object.keys(this.state.selected_students).reduce((agg, curr) => ({...agg, [curr]: false}), {})
			})
		}
		else {
			this.setState({
				selected_students: Object.keys(this.state.selected_students).reduce((agg, curr) => ({...agg, [curr]: true}), {})
			})

		}
	}

	selectPresentOrNone = () => {
		const students = this.props.students

		const selection = Object.keys(this.state.selected_students)
			.reduce((agg, sid) => {
				
				const x = students[sid]

				const current_attendance = (x.attendance || {})[moment(this.state.date).format("YYYY-MM-DD")];
				const status = current_attendance ? current_attendance.status : "n/a"

				if(status === "PRESENT") {
					return {
						...agg,
						[sid]: true
					}
				}

				return {
					...agg,
					[sid]: false
				}

			}, {})

		this.setState({
			selected_students: selection
		})
	}

	selectAbsentOrNone = () => {
		const students = this.props.students

		const selection = Object.keys(this.state.selected_students)
			.reduce((agg, sid) => {
				
				const x = students[sid]

				const current_attendance = (x.attendance || {})[moment(this.state.date).format("YYYY-MM-DD")];
				const status = current_attendance ? current_attendance.status : "n/a"

				if(status === "ABSENT") {
					return {
						...agg,
						[sid]: true
					}
				}

				return {
					...agg,
					[sid]: false
				}

			}, {})

		this.setState({
			selected_students: selection
		})
	}

	selectLeaveOrNone = () => {
		const students = this.props.students

		const selection = Object.keys(this.state.selected_students)
			.reduce((agg, sid) => {
				
				const x = students[sid]

				const current_attendance = (x.attendance || {})[moment(this.state.date).format("YYYY-MM-DD")];
				const status = current_attendance ? current_attendance.status : "n/a"

				if(this.getLeaveStatus(status)) {
					return {
						...agg,
						[sid]: true
					}
				}

				return {
					...agg,
					[sid]: false
				}

			}, {})

		this.setState({
			selected_students: selection
		})
	}

	onSectionChange = (e : any) => {
		const newSectionId = e.target.value;

		this.setState({
			selected_section: newSectionId,
			selected_students: deriveSelectedStudents(newSectionId, this.props.students)
		})

	}

	relevant_students = () => {
		Object.keys(this.state.selected_students)
			.map(id => this.props.students[id])
	}

	getLeaveStatus = (s : string) : boolean => s === "LEAVE" || s === "SHORT_LEAVE" || s === "SICK_LEAVE" || s === "CASUAL_LEAVE"

	markLeave = (e: { target: { value: any; }; }, x: MISStudent) => {
		const status = e.target.value
		
		if (status === "") {
			console.log("EMPTY RETURNING")
			return
		}

		this.mark(x, status)()
	}

	render() {

		const messages = Object.entries(this.state.selected_students)
			.reduce((agg, [sid, selected]) => {
				if(!selected) {
					return agg;
				}

				const student = this.props.students[sid]
				const att = (student.attendance || {})[moment(this.state.date).format("YYYY-MM-DD")];

				if(att === undefined) {
					return agg;
				}

				return [...agg, {
					number: student.Phone,
					text: `Date: ${moment().format("DD/MM/YYYY")}\n${this.props.attendance_message_template.replace(/\$NAME/g, student.Name).replace(/\$STATUS/g, att.status)}`
				}]

			}, [])
			
		const url = smsIntentLink({
			messages,
			return_link: window.location.href
		});
		const { settings, current_faculty, students, classes } = this.props;
		const isAdmin = current_faculty.Admin
		const setupPage = settings.permissions && settings.permissions.setupPage ? settings.permissions.setupPage.teacher : true

		const sortedSections = getSectionsFromClasses(classes).sort((a, b) => (a.classYear || 0) - (b.classYear || 0));

		return <Layout history={this.props.history}>
			<div className="attendance">
				<div className="title">Attendance</div>

				<input type="date" 
					onChange={this.Former.handle(["date"], d => moment(d).unix() < moment.now())} 
					value={moment(this.state.date).format("YYYY-MM-DD")} 
					placeholder="Current Date" />
				
				<div className="selectors">
					<div className="row">
						<div className="button select-all" onClick={this.selectAllOrNone}>{Object.values(this.state.selected_students).every(x => x) ? "Select None" : "Select All"}</div>
						<div className="button select-all" onClick={this.selectPresentOrNone}>P</div>
						<div className="button select-all" onClick={this.selectAbsentOrNone}>A</div>
						<div className="button select-all" onClick={this.selectLeaveOrNone}>L</div>
					</div>
					
					<div className="row">
						<select onChange={this.onSectionChange} value={this.state.selected_section} style={{ marginLeft: "auto"}}>
							{
								sortedSections.map(s => <option key={s.id} value={s.id}>{s.namespaced_name}</option>)
							}
						</select>
					</div>
					
				</div>
				<div className="list">
				{
					Object.keys(this.state.selected_students)
							.sort((id_a, id_b) => (students[id_a].RollNumber !== undefined && students[id_b].RollNumber !== undefined ) && (parseFloat(students[id_a].RollNumber) - parseFloat(students[id_b].RollNumber)))
						.map(sid => {
							const x = students[sid]

							const current_attendance = (x.attendance || {})[moment(this.state.date).format("YYYY-MM-DD")];
							const status = current_attendance ? current_attendance.status : "n/a"

							return <div className="list-row" key={x.id}>
								<input type="checkbox" {...this.Former.super_handle(["selected_students", x.id])}></input>
								<div> {`${x.RollNumber === "" || x.RollNumber === undefined ? "" : x.RollNumber }`} </div>
								{isAdmin || setupPage ? <Link className="student" to={`/student/${x.id}/attendance`}>{x.Name}</Link> : <div> {x.Name} </div>}
								<div className="status">
									<div className={`button ${status === "PRESENT" ? "green" : false}`} onClick={this.mark(x, "PRESENT")}>P</div>
									<div className={`button ${status === "ABSENT" ? "red" : false}`} onClick={this.mark(x, "ABSENT")}>A</div>
									<select value={status} className={`select button ${this.getLeaveStatus(status) ? "grey" : false}`} onChange={(e) => this.markLeave(e,x)}>
										<option value="">Select Leave</option>
										<option value="LEAVE">Leave</option>
										<option value="SHORT_LEAVE">Short Leave</option>
										<option value="SICK_LEAVE">Sick Leave</option>
										<option value="CASUAL_LEAVE">Casual Leave</option>
									</select>
								</div>
							</div>
						})
				}
				</div>
				{ Object.values(this.state.selected_students).some(x => x) ? <a href={url} className="button blue" onClick={() => this.sendBatchSMS(messages)}>Send SMS</a> : false }
			</div>
		</Layout>
	}
}


export default connect((state: RootReducerState) => ({
	current_faculty: state.db.faculty[state.auth.faculty_id],
	students: state.db.students,
	classes: state.db.classes,
	settings: state.db.settings,
	connected: state.connected,
		attendance_message_template: (state.db.sms_templates || {} as RootDBState["sms_templates"]).attendance || "",
}), (dispatch : Function) => ({
	markStudent: (student: MISStudent, date: string, status: MISStudentAttendanceEntry["status"]) => dispatch(markStudent(student, date, status)),
	logSms: (history: any) => dispatch(logSms(history))
}))(Attendance)