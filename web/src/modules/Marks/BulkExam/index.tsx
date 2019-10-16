import React, { Component } from 'react'
import Layout from '../../../components/Layout'
import { RouteComponentProps } from 'react-router'
import { connect } from 'react-redux'

import './style.css'
import Former from '../../../utils/former'
import moment from 'moment'


interface P {
	students: RootDBState["students"]
	exams: RootDBState["exams"]
	classes: RootDBState["classes"]
}

interface S {
	start_date: number
	end_date: number
}

interface RouteInfo {
	class_id: string
	section_id: string
}

type propTypes = RouteComponentProps<RouteInfo> & P


class BulkExam extends Component<propTypes, S> {

	former: Former
	constructor(props: propTypes) {
		super(props)
	
		this.state = {
			start_date: moment.now() ,
			end_date: moment.now()
		}

		this.former = new Former(this,[])
	}

	isSameOrBetween = (start_date: number, end_date: number, date: number) => {
		return moment(date).isSameOrAfter(start_date) && moment(date).isSameOrBefore(end_date)
	}
	
	render() {
	
		const { students, exams, classes } = this.props
		const { class_id, section_id } = this.props.match.params
		const { start_date, end_date } = this.state

		const curr_section = classes[class_id].sections[section_id]

		console.log("Start Date", moment(start_date).format("MM-DD-YYYY"))
		console.log("End Date", moment(end_date).format("MM-DD-YYYY"))

		const relevant_students = Object.values(students)
			.filter(s => s.Name && s.section_id === section_id)

		const relevant_exams = Object.values(exams)
			.filter(e => e.class_id === class_id && e.section_id === section_id)

		console.log("FILTERES EXAMS", relevant_exams)
		
		return <Layout history={this.props.history}>
			
			<div className="bulk-exam">
				
				<div className="title">Bulk Exam</div>
				
				<div className="form">
					<div className="row">
						<label> Start Date </label>
						<input onChange={this.former.handle(["start_date"])} type="date" value={moment(this.state.start_date).format("YYYY-MM-DD")}/>
					</div>
					<div className="row">
						<label> End Date </label>
						<input onChange={this.former.handle(["end_date"])} type="date" value={moment(this.state.end_date).format("YYYY-MM-DD")}/>
					</div>
					<div className="row">
						<label> Exam </label>
						<select>
							{
								relevant_exams
									.map(e => <option value={e.id}> { `${e.name} (${moment(e.date).format("DD-MM-YY")})` } </option>)
							}
						</select>
					</div>
				</div>
				<div className="section" >

				</div>
			</div>
		</Layout>
	}
}
export default connect((state : RootReducerState) => ({
	students: state.db.students,
	exams: state.db.exams,
	classes: state.db.classes
}), (dispatch: Function) => {})(BulkExam)