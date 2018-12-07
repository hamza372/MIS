import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import moment from 'moment'

import Former from 'utils/former'
import { PrintHeader } from 'components/Layout'

import './style.css'
 
class StudentMarksContainer extends Component {

	constructor(props) {
		super(props)
		this.state = {
			start: moment().subtract(3, "month"),
			end: moment.now()
		}

		this.former = new Former(this, []);
	}

	render() {
		const {match, students, exams, settings} = this.props;
		const id = match.params.id;

		const student = students[id];

		return <div className="student-marks-container">
				<div className="no-print">
					<div className="form">
						<div className="row">
							<label>Start Date</label>
							<input type="date" onChange={this.former.handle(["start"])} value={moment(this.state.start).format("YYYY-MM-DD")} placeholder="Start Date" />
						</div>
						<div className="row">
							<label>End Date</label>
							<input type="date" onChange={this.former.handle(["end"])} value={moment(this.state.end).format("YYYY-MM-DD")} placeholder="End Date" />
						</div>
					</div>
				</div>
				<StudentMarks student={student} exams={exams} settings={settings} startDate={moment(this.state.start).unix() * 1000} endDate={moment(this.state.end).unix() * 1000}/>

				<div className="print button" onClick={() => window.print()} style={{ marginTop: "15px", marginRight: "5%", alignSelf: "flex-end", }}>Print</div>
			</div>
	}
}

export const StudentMarks = ({student, exams, settings, startDate=0, endDate=moment.now()}) => {
	
	const start = moment(startDate);
	const end = moment(endDate);

	const { total_possible, total_marks } = Object.keys(student.exams || {})
		.map(exam_id => exams[exam_id])
		.filter(exam => moment(exam.date).isBetween(start, end))
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
				.filter(exam => moment(exam.date).isBetween(start, end))
				.sort((a, b) => a.date - b.date)
				.map(exam => <div className="table row" key={exam.id}>
						<div>{moment(exam.date).format("MM/DD")}</div>
						<div>{exam.subject}</div>
						<Link to={`/reports/${exam.class_id}/${exam.section_id}/exam/${exam.id}`}>{exam.name}</Link>
						<div>{student.exams[exam.id].score}</div>
						<div >{exam.total_score}</div>
						<div>{(student.exams[exam.id].score / exam.total_score * 100).toFixed(2)}</div>
					</div>),
					<div className="table row footing" key={`${student.id}-total-footing`}>
						<label><b>Total Marks</b></label>
						<label><b>Out of</b></label>
						<label><b>Percent</b></label>
					</div>,
					<div className="table row" key={`${student.id}-total-value`}>
						<div>{total_marks}</div>
						<div>{total_possible}</div>
						<div>{(total_marks/total_possible * 100).toFixed(2)}%</div>
					</div> 
			]
		}
		</div>
	
		<div className="print-only">
			<div style={{ marginTop: "100px" }}>
				<div>Signature: ___________________</div>
			</div>

			<div style={{ marginTop: "50px" }}>
				<div>Parent Signature: ___________________</div>
			</div>
		</div>
	</div>
}


export default connect(state => ({
	students: state.db.students,
	exams: state.db.exams,
	settings: state.db.settings
}))(StudentMarksContainer)
