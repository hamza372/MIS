import React, { Component } from 'react'
import { connect } from 'react-redux'

import './style.css'

class StudentAttendance extends Component {

	render() {

		const id = this.props.match.params.id;
		const student = this.props.students[id];

		const attendance = student.attendance;

		const { PRESENT: num_present, ABSENT: num_absent, LEAVE: num_leave } = Object.values(attendance).reduce((agg, curr) => {
			agg[curr.status] += 1;
			return agg;
		}, {PRESENT: 0, ABSENT: 0, LEAVE: 0})

		console.log(num_absent, num_present, num_leave)

		return <div className="student-attendance">
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
			<div className="divider">Record</div>
			{ Object.values(attendance)
				.map(
					rec => <div className="row" key={rec.date}>
						<label>{rec.date}</label>
						<div>{rec.status}</div>
					</div>
			)}

		</div>
	}
}

export default connect(state => ({ students: state.db.students }), dispatch => ({ }))(StudentAttendance)