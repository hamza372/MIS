import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

import List from 'components/List'
import Layout from 'components/Layout'

class ReportList extends Component {

	// display a list of all exams for this section.
	// TODO: figure out what 

	render() {

		const id = this.props.match.params.section_id;
		const exams = []

		return <Layout>
			<div className="reports-list">
				<List create={`/reports/${id}/new`} createText="New Exam">
				{
					exams.map(x => <Link to={`/reports/${id}/exam/${x.id}`}>{x.name}</Link>)
				}
				</List>
			</div>
		</Layout>

	}
}

export default ReportList;