import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import {getSectionsFromClasses} from 'utils/getSectionsFromClasses';
import Layout from 'components/Layout'

class Reports extends Component {

	render() {

		const sections = getSectionsFromClasses(this.props.classes)
		return <Layout history={this.props.history}>
			<div className="reports-page">
				<div className="title">Sections</div>
				<div className="list">
				{
					sections
					   .sort((a, b) => (a.classYear || 0) - (b.classYear || 0))
					   .map(s => <Link to={`/reports/${s.class_id}/${s.id}`} key={s.id}>{s.namespaced_name}</Link>)
				}
				</div>
			</div>
		</Layout>

	}
} 

export default connect(state => ({
	classes: state.db.classes
}))(Reports)
