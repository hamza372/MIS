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

type TD = MISExam & {
	obtained_marks: MISStudentExam
}

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

		console.log("Start Date", moment(start_date).format("MM-DD-YYYY"))
		console.log("End Date", moment(end_date).format("MM-DD-YYYY"))

		const relevant_students = Object.values(students)
			.filter(s => s.Name && s.exams && s.section_id === section_id)
		console.log("relebant students",relevant_students)
		const relevant_exams = Object.values(exams)
			.filter(e => e.class_id === class_id && e.section_id === section_id && this.isSameOrBetween(start_date, end_date, e.date))
		console.log("relevant exams", relevant_exams)
		const Subjects = new Set()
		
		const tableData = relevant_students
			.reduce((agg, curr) => {

				let new_exams: TD[] = []
				console.log(curr.Name)
				for (let e of relevant_exams) {
					console.log("EXAM_id", e.id)
					if (curr.exams[e.id]) {
						new_exams.push({
							...exams[e.id],
							obtained_marks: curr.exams[e.id]
						})
					} else {
						console.log("MISSING EXAM",exams[e.id])
						new_exams.push({
							...exams[e.id],
							obtained_marks: { score: 0, remarks: "", grade:""}
						})
					}
				}

				const s_exams = Object.entries(relevant_exams)
					.map(([e_id, e]) => {
					
						Subjects.add(e.name + "-" + e.subject + "(" + e.total_score + ")" + "-" + moment(e.date).format("DD/MM/YY"))
					
						return {
							...e,
							obtained_marks: e
						}
					})


				return [
					...agg,
					{
						Name: curr.Name,
						id: curr.id,
						exams: new_exams
					}
				]
			}, [] as { Name: string, id: string, exams: TD[] }[])
		
		console.log("TableData", tableData)

		// const tableDataTwo = tableData.map(e => {
		// 	const subjectsLength = Array.from(Subjects).length
			
		// 	if (subjectsLength > e.exams.length) {
		// 		let stopper = subjectsLength - e.exams.length
		// 		for (let count = 0; count < stopper; count++) {
		// 			e.exams = [ ...e.exams, { absent: true}]
					
		// 		}
		// 	}

		// 	return {}
		// })
		console.log("FILTERES EXAMS", relevant_exams)
		
		return <Layout history={this.props.history}>
			
			<div className="bulk-exam">
				
				<div className="title">Bulk Exam</div>
				
				<div className="form no-print">
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
							<option value=""> Select</option>
							{
								relevant_exams
									.map(e => <option value={e.id}> { `${e.name} (${moment(e.date).format("DD-MM-YY")})` } </option>)
							}
						</select>
					</div>
				</div>
				<div className="section newtable">
					<div className="newtable-row heading">
						<div>Student</div>
						{
							Array.from(Subjects)
								.map(s => <div> {s} </div>)
						}
					</div>
					{
						tableData
							.filter( s => s.exams.length !== 0)
							.map((s, index) => {
								return <div className="newtable-row">
									{/* <div>{index + 1}</div> */}
									<div>{s.Name}</div>
									{
										s.exams
											.map(e => {
												return <div> {`${e.obtained_marks.score} / ${e.total_score}`} </div>
											})
									}
								</div>
							})
					}


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