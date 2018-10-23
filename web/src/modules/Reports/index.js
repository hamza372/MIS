import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import Layout from 'components/Layout'

class Reports extends Component {

	getSectionsFromClasses = (classes) => {

		const sections = Object.values(classes)
			.reduce((agg, c) => {
				// each section
				return [...agg, ...Object.entries(c.sections)
					.reduce((agg2, [id, section]) => {
						return [
							...agg2,
							{
								id,
								namespaced_name: `${c.name}-${section.name}`,
								...section
							}
						]
					}, [])]
			}, [])

			console.log(sections)
			return sections;
	}

	render() {

		console.log(this.props)

		const sections = this.getSectionsFromClasses(this.props.classes)
		return <Layout>
			<div className="reports-page">
				<div className="title">Sections</div>
				<div className="list">
				{
					sections.map(s => <Link to={`/reports/${s.id}`} key={s.id}>{s.namespaced_name}</Link>)
				}
				</div>
			</div>
		</Layout>

	}
}

export default connect(state => ({
	classes: state.db.classes
}))(Reports)
