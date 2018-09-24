import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'

import './style.css'

class FacultyAttendance extends Component {

	render() {

		const id = this.props.match.params.id;
		const faculty = this.props.faculty[id];

		const attendance = faculty.attendance;

		/*
		const { PRESENT: num_present, ABSENT: num_absent, LEAVE: num_leave } = Object.values(attendance)
			.reduce((agg, curr) => {
				agg[curr.status] += 1;
				return agg;
			}, {PRESENT: 0, ABSENT: 0, LEAVE: 0})
		*/
		/*
			<div className="row">
				<label>Days Present:</label>
				<div>{num_present}</div>
			</div>
			<div className="row">
				<label>Days Absent:</label>
				<div>{num_absent}</div>
			</div>
			<div className="row">
				<label>Days on Leave:</label>
				<div>{num_leave}</div>
			</div>
			<div className="row">
				<label>Percentage:</label>
				<div>{(num_present / (num_absent + num_present) * 100).toFixed(2)}%</div>
			</div>
		*/

		console.log(attendance)
		return <div className="faculty-attendance">
			<div className="divider">Record</div>
			{ Object.entries(attendance)
				.map(
					([date, rec]) => {
						return <div className="row" key={date}>
							<label>{moment(date).format("MM-DD")}</label>
							{ rec.check_in && rec.check_out ? <div>In: {moment(rec.check_in).format("HH:mm")} Out: {moment(rec.check_out).format("HH:mm")}</div> : false}
							{ rec.check_in && !rec.check_out ? <div>In: {moment(rec.check_in).format("HH:mm")}</div> : false}
							{ rec.absent ? <div>Absent</div> : false }
							{ rec.leave ? <div>Leave</div> : false }
						</div>
					}
			)}

		</div>
	}
}

export default connect(
	state => ({ faculty: state.db.faculty }),
	dispatch => ({ }) )(FacultyAttendance)