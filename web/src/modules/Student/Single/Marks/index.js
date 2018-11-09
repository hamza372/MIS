import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import moment from 'moment'

import './style.css'

import { PrintHeader } from 'components/Layout'

const StudentMarksContainer = ({match, students, exams, settings}) => {

	const id = match.params.id;

	const student = students[id];

	return <div className="student-marks-container">
			<StudentMarks student={student} exams={exams} settings={settings} />
			<div className="print button" onClick={() => window.print()}>Print</div>
		</div>
}

export const StudentMarks = ({student, exams, settings}) => {
	
	const { total_possible, total_marks } = Object.keys(student.exams || {})
		.map(exam_id => exams[exam_id])
		.reduce((agg, curr) => ({
			total_possible: agg.total_possible + parseFloat(curr.total_score),
			total_marks: agg.total_marks + parseFloat(student.exams[curr.id].score)
		}), {
			total_possible: 0,
			total_marks: 0
		})

	return <div className="student-marks">
		<PrintHeader settings={settings} />

		<div className="title">Result Card</div>
		<div className="student-info">
			<div className="name"><b>Student Name:</b> {student.Name}</div>
		</div>
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
			[...Object.keys(student.exams || {})
				.map(exam_id => exams[exam_id])
				.sort((a, b) => b.date - a.date)
				.map(exam => <div className="table row" key={exam.id}>
						<div>{moment(exam.date).format("MM/DD")}</div>
						<div>{exam.subject}</div>
						<Link to={`/reports/${exam.class_id}/${exam.section_id}/exam/${exam.id}`}>{exam.name}</Link>
						<div>{student.exams[exam.id].score}</div>
						<div >{exam.total_score}</div>
						<div>{(student.exams[exam.id].score / exam.total_score * 100).toFixed(2)}</div>
					</div>),
					<div className="table row footing" key={`${student.id}-total-heading`}>
						<label><b>Total Marks</b></label>
						<label><b>Out of</b></label>
						<label><b>Percent</b></label>
					</div>,
					<div className="table row" key={`${student.id}-total-heading`}>
						<div>{total_marks}</div>
						<div>{total_possible}</div>
						<div>{(total_marks/total_possible * 100).toFixed(2)}%</div>
					</div> 
			]
		}
		</div>
	</div>
}


export default connect(state => ({
	students: state.db.students,
	exams: state.db.exams,
	settings: state.db.settings
}))(StudentMarksContainer)
