import React from 'react'
import { connect } from 'react-redux'

import { StudentMarks } from 'modules/Student/Single/Marks'

import './style.css'

const ClassReports = ({ match, classes, students, exams }) => {

	const id = match.params.id;

	const current_class = classes[id];
	const section_set = new Set(Object.keys(current_class.sections));

	const relevant_students = Object.values(students)
		.filter(s => section_set.has(s.section_id))

	console.log(relevant_students[0])

	return <Layout>
		<div className="class-report">
			{
				relevant_students.map(s => 
					<div className="student-report" key={s.id}>
						<div className="title">{s.Name}</div>
						<StudentMarks student={s} exams={exams} />
					</div>)
			}
		</div>
	</Layout>
}

export default connect(state => ({
	classes: state.db.classes,
	students: state.db.students,
	exams: state.db.exams
}))(ClassReports)