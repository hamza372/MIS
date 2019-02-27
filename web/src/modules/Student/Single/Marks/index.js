import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import moment from 'moment'
import { logSms } from 'actions'
import { smsIntentLink } from 'utils/intent'

import Former from 'utils/former'
import { PrintHeader } from 'components/Layout'

import './style.css'

class StudentMarksContainer extends Component {

	constructor(props) {
		super(props)
		this.state = {
			start: moment().subtract(3, "month"),
			end: moment.now(),
			examFilterText: "",
			subjectFilterText: ""
		}

		this.former = new Former(this, []);
	}

	logSms = () =>{

		const historyObj = {
			faculty: this.props.faculty_id,
			date: new Date().getTime(),
			type: "EXAM",
			count: 1,
		}

		this.props.logSms(historyObj)
	}

	render() {
		const {match, students, settings, sms_templates, exams, classes } = this.props;
		const id = match.params.id;
		const student = students[id];
		const curr_class = Object.values(classes).find(c => c.sections[student.section_id]!== undefined)		
		const subjectSet = new Set(); 
		const examSet = new Set();   

		for(let [e_id, e] of Object.entries(exams)){
			if(student.exams !== undefined && student.exams[e_id] !== undefined)
			{
				examSet.add(e.name)
				subjectSet.add(e.subject)
			}
		}
		const startDate = moment(this.state.start).unix() * 1000
		const endDate = moment(this.state.end).unix() * 1000

		const report_string = reportStringForStudent(student, exams, startDate, endDate, this.state.examFilterText, this.state.subjectFilterText );

		const text = sms_templates.result.replace(/\$NAME/g, student.Name).replace(/\$REPORT/g, report_string);

		const url = smsIntentLink({ messages: [{ number: student.Phone, text: text }], return_link: window.location.href })

		console.log("school logo thing", this.props.schoolLogo)
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
						<div className="row">
							<label>Exam Name</label>
							<select {...this.former.super_handle(["examFilterText"])}> 
								<option value="">Select Exam</option>
								{
									Array.from(examSet).map(exam => {
										return <option key={exam} value={exam}>{exam}</option>	
									})
								}
							</select>
						</div> 

						<div className="row">
							<label>Subject Name</label>
							<select {...this.former.super_handle(["subjectFilterText"])}> 
								<option value="">Select Subject</option>
								{
									Array.from(subjectSet).map(subject => {
										return <option key={subject} value={subject}>{subject}</option>	
									})
								}
							</select>
						</div>
					</div>
				</div>
				<StudentMarks student={student} exams={exams} settings={settings} startDate={startDate} endDate={endDate} examFilter={this.state.examFilterText} subjectFilter={this.state.subjectFilterText} curr_class={curr_class} logo={this.props.schoolLogo}/>


				{ settings.sendSMSOption === "SIM" ? <a href={url} onClick={this.logSms} className="button blue">Send SMS from Local SIM</a> : false }
				<div className="print button" onClick={() => window.print()} style={{ marginTop: "15px", marginRight: "5%", alignSelf: "flex-end", }}>Print</div>
			</div>
	}
}

export const getReportFilterCondition = (examFilter, exam, subjectFilter, subject) => 
{
	return (examFilter === exam || examFilter === "") && (subjectFilter === subject || subjectFilter === "")
}

export const reportStringForStudent = (student, exams, startDate=0, endDate=moment.now(), examFilter = "", subjectFilter = "") => {

	// we want a line for each exam. subject - exam name - marks / out of (percent)

	const start = moment(startDate)
	const end = moment(endDate)

	const relevant_exams = Object.keys(student.exams || {})
			.map(exam_id => exams[exam_id])
			.filter(exam => moment(exam.date).isBetween(start, end) && getReportFilterCondition(examFilter, exam.name, subjectFilter, exam.subject ))
	
	const { total_score, max_score } = relevant_exams.reduce((agg, exam) => ({ 
		total_score: agg.total_score + parseFloat(student.exams[exam.id].score, 10), 
		max_score: agg.max_score + parseFloat(exam.total_score, 10) }),
	{ total_score: 0, max_score: 0 })

	const report_arr= [
		...relevant_exams
			.sort((a, b) => a.date - b.date)
			.map(exam => `${exam.subject} ${examFilter === "" ? `- ${exam.name} -` : ""} ${student.exams[exam.id].score}/${exam.total_score} (${(student.exams[exam.id].score / exam.total_score * 100).toFixed(1)}%)`),
		`Total Marks: ${total_score.toFixed(1)}/${max_score.toFixed(1)}`,
		`Total Percentage: ${(total_score/max_score * 100).toFixed(1)}%`
		]
	
	if(examFilter !== "") {
		report_arr.unshift(examFilter)
	}
	
	return report_arr.join('\n');
}

export const StudentMarks = ({student, exams, settings, startDate=0, endDate=moment.now(), examFilter, subjectFilter, curr_class, logo }) => {
	
	const start = moment(startDate);
	const end = moment(endDate);
		
	const { total_possible, total_marks } = Object.keys(student.exams || {})
		.map(exam_id => exams[exam_id])
		.filter(exam => moment(exam.date).isBetween(start, end) && student.exams[exam.id].grade !== "Absent" && getReportFilterCondition(examFilter, exam.name, subjectFilter, exam.subject ))
		.reduce((agg, curr) => ({
			total_possible: agg.total_possible + parseFloat(curr.total_score),
			total_marks: agg.total_marks + parseFloat(student.exams[curr.id].score)
		}), {
			total_possible: 0,
			total_marks: 0
		})

	return <div className="student-marks">
		<PrintHeader settings={settings} logo={logo} />
		
		<div className="title">{ examFilter === "" ? "Report Card" : examFilter + " Report Card"}</div>
		<div className="student-info">
			<div className="row">
				<div className="name"><b>Student Name:</b> {student.Name}</div>
				<div style={{ marginLeft: "1em"}}><b>Roll No:</b> {student.RollNumber !== undefined ? student.RollNumber : "______"}</div>
				<div style={{ marginLeft: "1em"}}><b>Class Name:</b> {curr_class !== undefined ? curr_class.name: "______"} </div>
			</div>
		</div>
		<div className="section table">
			<div className="table row heading">
				<label><b>Date</b></label>
				<label><b>Subject</b></label>
				{examFilter === "" ? <label><b>Name</b></label> : false}
				<label><b>Total</b></label>
				<label><b>Obtained</b></label>
				<label><b>Percent</b></label>
				<label><b>Grade</b></label>
				<label><b>Remarks</b></label>
			</div>
		{
			[...Object.keys(student.exams || {})
				.map(exam_id => exams[exam_id])
				.filter(exam => moment(exam.date).isBetween(start, end) && getReportFilterCondition(examFilter, exam.name, subjectFilter, exam.subject ))
				.sort((a, b) => a.date - b.date)
				.map(exam => <div className="table row" key={exam.id}>
						<div>{moment(exam.date).format("MM/DD")}</div>
						<div>{exam.subject}</div>
						{examFilter === "" ? <Link to={`/reports/${exam.class_id}/${exam.section_id}/exam/${exam.id}`}>{exam.name}</Link> : false}
						<div>{exam.total_score}</div>
						<div>{student.exams[exam.id].grade !== "Absent" ? student.exams[exam.id].score: "N/A"}</div>
						<div>{student.exams[exam.id].grade !== "Absent" ? (student.exams[exam.id].score / exam.total_score * 100).toFixed(2) : "N/A"}</div>
						<div>{student.exams[exam.id].grade}</div>
						<label>{student.exams[exam.id].remarks}</label>
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

			<div style={{marginTop: "40px"}}>
				<div>Principal Comments </div> 
				<div style={{marginTop: "10px"}}> _______________________________________________________________</div>
				<div style={{marginTop: "10px"}}> _______________________________________________________________</div>
			</div>

			<div style={{ marginTop: "40px" }}>
				<div>Teacher Signature: ___________________</div>
			</div>

			<div style={{ marginTop: "20px", marginBottom:"80px" }}>
				<div>Parent Signature: ___________________</div>
			</div>
		</div> 
	</div>
}


export default connect(state => ({
	faculty_id: state.auth.faculty_id,
	students: state.db.students,
	exams: state.db.exams,
	classes: state.db.classes,
	settings: state.db.settings,
	sms_templates: state.db.sms_templates,
	schoolLogo: state.db.assets ? (state.db.assets.schoolLogo || "") : "" 
}), dispatch => ({
	logSms: (history)=> dispatch(logSms(history)),
}))(StudentMarksContainer)
