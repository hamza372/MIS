import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import moment from 'moment'

import './style.css'

class StudentMarks extends Component {

	render() {

		const id = this.props.match.params.id;

		const student = this.props.students[id];

		return <div className="student-marks">
			<div className="section table">
				<div className="table row heading">
					<label><b>Date</b></label>
					<label><b>Subject</b></label>
					<label><b>Name</b></label>
					<label><b>Marks</b></label>
					<label><b>Out of</b></label>
					<label><b>Percent</b></label>
				</div>
			{
				Object.keys(student.exams || {})
					.map(exam_id => this.props.exams[exam_id])
					.map(exam => <div className="table row" key={exam.id}>
							<div>{moment(exam.date).format("MM/DD")}</div>
							<div>{exam.subject}</div>
							<Link to={`/reports/${exam.class_id}/${exam.section_id}/exam/${exam.id}`}>{exam.name}</Link>
							<div>{student.exams[exam.id].score}</div>
							<div >{exam.total_score}</div>
							<div>{(student.exams[exam.id].score / exam.total_score * 100).toFixed(2)}</div>
						</div>)
			}
			</div>
		</div>
	}
}

export default connect(state => ({
	students: state.db.students,
	exams: state.db.exams
}))(StudentMarks)