import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import Layout from 'components/Layout'
import { markStudent } from 'actions'

import moment from 'moment'
import Former from 'utils/former'

import './style.css'

class Attendance extends Component {

	constructor(props) {
		super(props);

		this.state = {
			date: moment.now()
		}

		this.Former = new Former(this, [])
	}

	mark = (student, status) => () => {
		console.log('mark student', student.Name, status)
		this.props.markStudent(student, moment(this.state.date).format("YYYY-MM-DD"), status);
	}

	sendBatchSMS = () => {
		console.log('send batch sms');

		// we need to jump to the right url `intent://whatever'

	}

	render() {

		const payload = [{
			number: "+9203222932227",
			text: "helllo"
		}]

		const url = `intent://mis.metal.fish/android-sms?payload=${encodeURI(JSON.stringify(payload))}#Intent;scheme=https;package=pk.org.cerp.mischool.mischoolcompanion;end`

		return <Layout>
			<div className="attendance">
				<div className="title">Attendance</div>

				<input type="date" onChange={this.Former.handle(["date"], d => moment(d) < moment.now())} value={moment(this.state.date).format("YYYY-MM-DD")} placeholder="Current Date" />
				<div className="list">
				{
					this.props.students.map(x =>  {

						const current_attendance = (x.attendance || {})[moment(this.state.date).format("YYYY-MM-DD")];
						const status = current_attendance ? current_attendance.status : "n/a"

						return <div className="list-row" key={x.id}>
							<Link className="student" to={`/student/${x.id}/attendance`}>{x.Name}</Link>
							<div className="status">
								<div className={`button ${status === "PRESENT" ? status : false}`} onClick={this.mark(x, "PRESENT")}>Present</div>
								<div className={`button ${status === "ABSENT" ? status : false}`} onClick={this.mark(x, "ABSENT")}>Absent</div>
								<div className={`button ${status === "LEAVE" ? status : false}`} onClick={this.mark(x, "LEAVE")}>Leave</div>
							</div>
					</div>})
				}
				</div>
				{ !this.props.connected ? <a href={url} className="button">Send SMS</a> : false }
			</div>
		</Layout>

	}
}

export default connect(state => {

	const faculty = state.db.faculty[state.auth.faculty_id];

	const sections = Object.values(state.db.classes)
		.reduce((agg, curr) => [...agg, ...Object.entries(curr.sections)], [])
		.filter(([id, s]) => s.faculty_id === faculty.id);

	const students = Object.values(state.db.students)
		.filter(s => sections.find(([id, section]) => id === s.section_id) !== undefined)

	return {
		students,
		connected: state.connected
	}

}, dispatch => ({
	markStudent: (student, date, status) => dispatch(markStudent(student, date, status))
}))(Attendance)