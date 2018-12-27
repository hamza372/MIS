import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import List from 'components/List'
import Layout from 'components/Layout'

const ExamItem = (exam) =>{
return <div className="table row">
	{ !exam.permission.isAdmin?
		exam.permission.profile_info_permission ?
		<Link key={exam.id} to={`/reports/${exam.class_id}/${exam.section_id}/exam/${exam.id}`}>
			{examLabel(exam)}
		</Link> : <div key={exam.id}> {examLabel(exam)} </div> 
	  :<Link key={exam.id} to={`/reports/${exam.class_id}/${exam.section_id}/exam/${exam.id}`}>
			{examLabel(exam)}
		</Link>
	}
	</div>
}

const examLabel = (exam) => `${exam.subject}: ${exam.name}`;

class ReportList extends Component {

	render() {

		const section_id = this.props.match.params.section_id;
		const class_id = this.props.match.params.class_id;

		const permission = { 
			isAdmin: this.props.admin,
			profile_info_permission: true
		}

		const items = Object.entries(this.props.exams)
			.filter(([id, exam]) => exam.class_id === class_id && exam.section_id === section_id)
			.sort(([, a], [, b]) => `${a.subject}: ${a.name}`.localeCompare(`${b.subject}: ${b.name}`))
			.map(([id, exam]) => ({ ...exam, id, permission }))
		const create = this.props.admin ? `/reports/${class_id}/${section_id}/new` : `/reports/${class_id}/${section_id}/new`

		return <Layout history={this.props.history}>
			<div className="reports-list">
				<div className="title">Exams</div>

				<List 
					  items={items}
					  Component={ExamItem} 
					  create={create} 
					  createText="New Exam" 
					  toLabel={examLabel}
					  />

			</div>
		</Layout>

	}
}

export default connect(state => ({
	exams: state.db.exams,
	admin: state.db.faculty[state.auth.faculty_id].Admin
}))(ReportList);