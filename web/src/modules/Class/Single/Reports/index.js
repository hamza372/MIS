import React from 'react'
import { connect } from 'react-redux'

import Layout from 'components/Layout'

import { StudentMarks, reportStringForStudent } from 'modules/Student/Single/Marks'
import { smsIntentLink } from 'utils/intent'

import './style.css'

const ClassReports = ({ match, classes, students, exams, settings, sms_templates }) => {

	const id = match.params.id;
	const start = parseFloat(match.params.start)
	const end = parseFloat(match.params.end)

	const current_class = classes[id];
	const section_set = new Set(Object.keys(current_class.sections));

	const relevant_students = Object.values(students)
		.filter(s => section_set.has(s.section_id))

	const messages = relevant_students.map(student => ({
		number: student.Phone,
		text: sms_templates.result.replace(/\$NAME/g, student.Name).replace(/\$REPORT/g, reportStringForStudent(student, exams, start, end))
	}))

	console.log(messages)

	const url = smsIntentLink({
		messages,
		return_link: window.location.href
	})


	return <div className="class-report" style={{height: "100%"}}>
			<div className="print button" onClick={() => window.print()}>Print</div>
			{ settings.sendSMSOption === "SIM" ? <a className="button blue" href={url} style={{display: "block"}}>Send Reports using SMS</a> : false }
			{
				//TODO: put in total marks, grade, signature, and remarks.
				relevant_students.map(s => 
					<div className="print-page student-report" key={s.id} style={{ height: "100%" }}>
						<StudentMarks student={s} exams={exams} settings={settings} startDate={start} endDate={end} />
					</div>)
			}
		</div>
}

export default connect(state => ({
	classes: state.db.classes,
	students: state.db.students,
	settings: state.db.settings,
	exams: state.db.exams,
	sms_templates: state.db.sms_templates
}))(ClassReports)