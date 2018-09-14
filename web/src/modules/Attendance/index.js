import React, { Component } from 'react'
import { connect } from 'react-redux'

import Layout from 'components/Layout'
import { markStudent } from 'actions'

import './style.css'

class Attendance extends Component {

	render() {

		return <Layout>
			<div className="attendance">
				<div className="title">Attendance</div>
				<div className="list">
				{
					this.props.students.map(x => 
						<div className="row" key={x.id}>
							<div className="student">{x.Name}</div>
							<div className="status">
								<div className="button">Present</div>
								<div className="button">Absent</div>
								<div className="button">Excused</div>
							</div>
						</div>)
				}
				</div>
			</div>
		</Layout>

	}

}

export default connect(state => {

	const current_user = state.auth.username; // if i store username here i can eliminate the first search

	const faculty = Object.values(state.db.faculty)
		.find(x => x.Username === current_user);

	const sections = Object.values(state.db.classes)
		.reduce((agg, curr) => [...agg, ...Object.values(curr.sections)], [])
		.filter(s => s.faculty_id === faculty.id);

	const students = Object.values(state.db.students)
		.filter(s => sections.find(section => section.id === s.section_id) !== undefined)

	return {
		students 
	}

}, dispatch => ({
	markStudent: (student, status) => dispatch(markStudent(student, status))
}))(Attendance)