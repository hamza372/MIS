import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'

import Former from 'utils/former'
import Layout from 'components/Layout'

import { markFaculty, undoFacultyAttendance } from 'actions'

import './style.css'

class TeacherAttendance extends Component {

	constructor(props) {
		super(props);

		this.state = {
			date: moment.now()
		}

		this.Former = new Former(this, []);
	}

	mark = (faculty, status) => () => {

		console.log(faculty.Name, status)

		this.props.markFaculty(faculty, moment(this.state.date).format("YYYY-MM-DD"), status);
	}

	undo = (faculty) => {
		this.props.undoFaculty(faculty, moment(this.state.date).format("YYYY-MM-DD"));
	}

	render() {

		if(!this.props.user.Admin) {
			return <Layout history={this.props.history}>
				<div className="title">Only Admins can visit this page</div>
			</Layout>
		}

		return <Layout history={this.props.history}>
			<div className="teacher-attendance">
				<div className="title">Teacher Attendance</div>

				<input type="date" placeholder="Current Date"
					onChange={this.Former.handle(["date"], d => moment(d) < moment.now())} 
					value={moment(this.state.date).format("YYYY-MM-DD")} />

				<div className="list">
				{
					Object.values(this.props.faculty)
						.filter(f => f && f.Active && f.Name)
						.sort((a, b) => a.Name.localeCompare(b.Name))
						.map(f => {
							const current_attendance = ((f.attendance || {})[moment(this.state.date).format("YYYY-MM-DD")]) || { }

							// current_attendance should be something like blank if new day or, { check_in: time, check_out: time, absent: true, leave: true }

							return <div className="list-row" key={f.id}>
								<label>{f.Name}</label>
								<div className="status">
								
									{ (current_attendance.check_in || current_attendance.absent || current_attendance.leave) ? false : <div className="button check_in blue" onClick={this.mark(f, "check_in")}>P</div> }
									
									{ !current_attendance.check_in || current_attendance.check_out ? false : <label>Check In: { moment(current_attendance.check_in).format("HH:mm") }</label> }

									{ !current_attendance.check_in || current_attendance.check_out ? false : <div className="button check_out green" onClick={this.mark(f, "check_out")}>Check Out</div>}

									{ current_attendance.check_in || current_attendance.absent || current_attendance.leave ? false : <div className="button absent orange" onClick={this.mark(f, "absent")}>A</div> }

									{ current_attendance.check_in || current_attendance.absent || current_attendance.leave ? false : <div className="button leave grey" onClick={this.mark(f, "leave")}>L</div> }

									{ current_attendance.check_in && current_attendance.check_out ?  <div>Check In: <b>{moment(current_attendance.check_in).format("HH:mm")}</b> Check Out: <b>{moment(current_attendance.check_out).format("HH:mm")}</b></div>: false}

									{ current_attendance.absent ? <label>Absent</label> : false }
									
									{ current_attendance.leave ? <label>Leave</label> : false }

									{ (current_attendance.check_in || current_attendance.absent || current_attendance.leave) ? <div className="button leave grey" onClick={() => this.undo(f)}>Undo</div> : false }

								</div>
							</div>
						})
				}
				</div>
			</div>
		</Layout>
	}
}

export default connect(state => (
	{ 
		user: state.db.faculty[state.auth.faculty_id],
		faculty: state.db.faculty
	}), dispatch => (
	{
		markFaculty: (faculty, date, status) => dispatch(markFaculty(faculty, date, status)),
		undoFaculty: (faculty, date) => dispatch(undoFacultyAttendance(faculty,date))
	})
	)(TeacherAttendance);