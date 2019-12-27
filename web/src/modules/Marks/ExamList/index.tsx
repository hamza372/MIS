import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import Layout from 'components/Layout'
import { RouteComponentProps } from 'react-router';
import moment from 'moment'
import Former from 'utils/former'

type propsType = {
	exams: RootDBState["exams"]
	classes: RootDBState["classes"]
} & RouteComponentProps<RouteInfo>
interface RouteInfo {
	section_id: string
	class_id: string
}

interface S {
	exam_filter: {
		year: string
		title: string
	}
}
class ReportList extends Component<propsType, S> {
	
	former: Former
	constructor(props: propsType) {
		super(props)
		
		const year = moment().format("YYYY")

		this.state = {
			exam_filter: {
				year,
				title: ""
			}
		}

		this.former = new Former(this, ["exam_filter"])
	}

	isFilteratable = (exam: MISExam): boolean => {
		
		const { exam_filter } = this.state

		const class_id = this.props.match.params.class_id
		const section_id = this.props.match.params.section_id

		const flag = exam.class_id === class_id && exam.section_id === section_id &&
			moment(exam.date).format("YYYY") === exam_filter.year

		if(exam_filter.title === "") {
			return flag
		}

		return flag && exam.name === exam_filter.title
	}

	render() {

		const { section_id, class_id } = this.props.match.params

		const curr_class_name = this.props.classes[class_id].name || ""
		const curr_section_name = this.props.classes[class_id].sections[section_id].name || ""

		const exams = Object.entries(this.props.exams)

		const curr_section_exams = exams
			.filter(([id, exam]) => exam && exam.id && this.isFilteratable(exam))
			.map(([id, exam]) => ({ ...exam, id }))
		
		const years = new Set<string>()
		const exam_title = new Set<string>()

		for(const [, exam] of exams) {
			if(exam && exam.class_id === class_id && exam.section_id === section_id) {
				exam_title.add(exam.name)
				years.add(moment(exam.date).format("YYYY"))
			}
		}
		return <Layout history={this.props.history}>
			<div className="reports-list">
				<div className="title">{`Exams - ${ curr_class_name } (${curr_section_name})`}</div>
				
				<div className="table row" style={{margin: "10px 0px"}}>
					<Link className="button blue" to={`/reports/${class_id}/${section_id}/new`}>Create New Exam</Link>
				</div>
				
				<div className="form section" style={{width: "90%"}}>
					<div className="row">
						<label>Exam Year</label>
						<select {...this.former.super_handle(["year"])}>
							<option value="">Select Year</option>
							{ 
								Array.from(years).map(year => <option key={year} value={year}>{year}</option>) 
							}
						</select>
					</div>
					<div className="row">
						<label>Exam Title</label>
						<select {...this.former.super_handle(["title"])}>
							<option value="">Select Exam</option>
							{ 
								Array.from(exam_title)
									.sort((a, b) => a.localeCompare(b))
									.map(title => <option key={title} value={title}>{title}</option>) 
							}
						</select>
					</div>
				</div>
				<div className="list" style={{padding: "12px"}}>
					{
						curr_section_exams
							.map(exam => <div className="table row">
								<div>{new Date(exam.date).toLocaleDateString()}</div>
								<Link key={exam.id} to={`/reports/${exam.class_id}/${exam.section_id}/exam/${exam.id}`}>
									{exam.subject}
								</Link>
							</div>)
					}
				</div>
			</div>
		</Layout>

	}
}

export default connect((state: RootReducerState) => ({
	exams: state.db.exams,
	classes: state.db.classes
}))(ReportList);