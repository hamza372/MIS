import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

import List from 'components/List'
import Layout from 'components/Layout'

class ReportList extends Component {

	// display a list of all exams for this section.
	// TODO: figure out what 

	render() {

		const section_id = this.props.match.params.section_id;
		const class_id = this.props.match.params.class_id;

		return <Layout>
			<div className="reports-list">
				<div className="title">Exams</div>
				<List create={`/reports/${class_id}/${section_id}/new`} createText="New Exam">
				{
					Object.entries(this.props.exams)
						.filter(([id, exam]) => exam.class_id === class_id && exam.section_id === section_id)
						.sort(([, a], [, b]) => `${a.subject}: ${a.name}`.localeCompare(`${b.subject}: ${b.name}`))
						.map(([id, exam]) => <Link key={id} to={`/reports/${exam.class_id}/${exam.section_id}/exam/${id}`}>{exam.subject}: {exam.name}</Link>)
				}
				</List>
			</div>
		</Layout>

	}
}

export default connect(state => ({
	exams: state.db.exams
}))(ReportList);