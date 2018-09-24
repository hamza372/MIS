import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import moment from 'moment'

import Former from 'utils/former'
import Layout from 'components/Layout'

import { markFaculty } from 'actions'

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

	render() {

		if(!this.props.user.Admin) {
			return <Layout>
				<div className="title">Only Admins can visit this page</div>
			</Layout>
		}

		return <Layout>
			<div className="teacher-attendance">
				<div className="title">Teacher Attendance</div>

				<input type="date" placeholder="Current Date"
					onChange={this.Former.handle(["date"], d => moment(d) < moment.now())} 
					value={moment(this.state.date).format("YYYY-MM-DD")} />

				<div className="list">
				{
					Object.values(this.props.faculty)
						.map(f => {
							const current_attendance = ((f.attendance || {})[moment(this.state.date).format("YYYY-MM-DD")]) || { }

							// current_attendance should be something like blank if new day or, { check_in: time, check_out: time, absent: true, leave: true }

							console.log(f.Name, current_attendance)
							return <div className="list-row" key={f.id}>
								<Link to={`/teacher/${f.id}`}>{f.Name}</Link>
								<div className="status">
									{ (current_attendance.check_in || current_attendance.absent || current_attendance.leave) ? false : <div className="button check_in" onClick={this.mark(f, "check_in")}>Check In</div> }
									{ !current_attendance.check_in || current_attendance.check_out ? false : <label>Check In: { moment(current_attendance.check_in).format("HH:mm") }</label> }
									{ !current_attendance.check_in || current_attendance.check_out ? false : <div className="button check_out" onClick={this.mark(f, "check_out")}>Check Out</div>}
									{ current_attendance.check_in || current_attendance.absent || current_attendance.leave ? false : <div className="button absent" onClick={this.mark(f, "absent")}>Absent</div> }
									{ current_attendance.check_in || current_attendance.absent || current_attendance.leave ? false : <div className="button leave" onClick={this.mark(f, "leave")}>Leave</div> }
									{ current_attendance.check_in && current_attendance.check_out ? <label>{moment.utc(moment(current_attendance.check_out).diff(current_attendance.check_in)).format("HH:mm:ss")}</label> : false}
									{ current_attendance.absent ? <label>Absent</label> : false }
									{ current_attendance.leave ? <label>Leave</label> : false }
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
		markFaculty: (faculty, date, status) => dispatch(markFaculty(faculty, date, status))
	})
	)(TeacherAttendance);