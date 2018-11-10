import React from 'react'
import { connect } from 'react-redux'
import moment from 'moment'

import Layout, { PrintHeader } from 'components/Layout'

import { StudentMarks } from 'modules/Student/Single/Marks'

import './style.css'

const ClassReports = ({ match, classes, students, exams, settings }) => {

	const id = match.params.id;
	const start = moment(parseFloat(match.params.start))
	const end = moment(parseFloat(match.params.end))

	const current_class = classes[id];
	const section_set = new Set(Object.keys(current_class.sections));

	const relevant_students = Object.values(students)
		.filter(s => section_set.has(s.section_id))

	console.log(relevant_students[0])

	return <Layout>
		<div className="class-report">
			<div className="print button" onClick={() => window.print()}>Print</div>
			{
				//TODO: put in total marks, grade, signature, and remarks.
				relevant_students.map(s => 
					<div className="print-page student-report" key={s.id}>
						<StudentMarks student={s} exams={exams} settings={settings} startDate={parseFloat(match.params.start)} endDate={parseFloat(match.params.end)} />
					</div>)
			}
		</div>
	</Layout>
}

export default connect(state => ({
	classes: state.db.classes,
	students: state.db.students,
	settings: state.db.settings,
	exams: state.db.exams
}))(ClassReports)