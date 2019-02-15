import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import getSectionsFromClasses from 'utils/getSectionsFromClasses'

import { smsIntentLink } from 'utils/intent'
import Layout from 'components/Layout'
import { markStudent, logSms } from 'actions'

import moment from 'moment'
import Former from 'utils/former'

import './style.css'

const deriveSelectedStudents = (selected_section, students) =>  getStudentsForSection(selected_section, students)
	.reduce((agg, curr) => ({...agg, [curr.id]: true}), {})

const getStudentsForSection = (section_id, students) => Object.values(students)
	.filter(s => s.section_id === section_id)

class Attendance extends Component {

	constructor(props) {
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

	mark = (student, status) => () => {
		this.props.markStudent(student, moment(this.state.date).format("YYYY-MM-DD"), status);
	}

	sendBatchSMS = (messages) => {
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

	onSectionChange = e => {
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
					text: this.props.attendance_message_template.replace(/\$NAME/g, student.Name).replace(/\$STATUS/g, att.status)
				}]

			}, [])
			
		const url = smsIntentLink({
			messages,
			return_link: window.location.href
		});
		const setupPage = this.props.settings.permissions.setupPage ? this.props.settings.permissions.setupPage.teacher : true
		// also check if the template is blank - then drop a link to the /sms page and tell them to fill a template out.
		return <Layout history={this.props.history}>
			<div className="attendance">
				<div className="title">Attendance</div>

				<input type="date" onChange={this.Former.handle(["date"], d => moment(d) < moment.now())} value={moment(this.state.date).format("YYYY-MM-DD")} placeholder="Current Date" />

				<div className="row" style={{width: "90%"}}>
					<div className="button select-all" onClick={this.selectAllOrNone}>{Object.values(this.state.selected_students).every(x => x) ? "Select None" : "Select All"}</div>
					<select onChange={this.onSectionChange} value={this.state.selected_section} style={{ marginLeft: "auto"}}>
						{
							getSectionsFromClasses(this.props.classes)
								.map(s => <option key={s.id} value={s.id}>{s.namespaced_name}</option>)
						}
					</select>
				</div>
				<div className="list">
				{
					Object.keys(this.state.selected_students)
						.map(sid => {
							const x = this.props.students[sid]

							const current_attendance = (x.attendance || {})[moment(this.state.date).format("YYYY-MM-DD")];
							const status = current_attendance ? current_attendance.status : "n/a"

							return <div className="list-row" key={x.id}>
								<input type="checkbox" {...this.Former.super_handle(["selected_students", x.id])}></input>
								{setupPage ?<Link className="student" to={`/student/${x.id}/attendance`}>{x.Name}</Link> : <div> {x.Name} </div>}
								<div className="status">
									<div className={`button ${status === "PRESENT" ? "green" : false}`} onClick={this.mark(x, "PRESENT")}>P</div>
									<div className={`button ${status === "ABSENT" ? "red" : false}`} onClick={this.mark(x, "ABSENT")}>A</div>
									<div className={`button ${status === "LEAVE" ? "grey" : false}`} onClick={this.mark(x, "LEAVE")}>L</div>
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

export default connect(state => {

	return {
		current_faculty: state.db.faculty[state.auth.faculty_id],
		students: state.db.students,
		classes: state.db.classes,
		settings: state.db.settings,
		connected: state.connected,
		attendance_message_template: (state.db.sms_templates || {}).attendance || "",
	}

}, dispatch => ({
	markStudent: (student, date, status) => dispatch(markStudent(student, date, status)),
	logSms: (history) => dispatch(logSms(history))
}))(Attendance)