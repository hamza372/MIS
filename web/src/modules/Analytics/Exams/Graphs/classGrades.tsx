import React, { Component } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import calculateGrade from 'utils/calculateGrade'
import { ExamTitles } from 'constants/exam'

import Former from 'utils/former'

type PropsType = {
	relevant_students: MergeStudentsExams[]
	grades: MISGrades
	classes?: RootDBState["classes"]
	subjects?: string[]
}

type GraphData = {
	grade: string
	count: string
}

type S = {
	subject: string
	class_id: string
} & ExamFilter

class ClassGradesGraph extends Component<PropsType, S> {
	former: Former
	constructor(props: PropsType) {
		super(props)

		this.state = {
			year: "",
			subject: "",
			exam_title: "",
			class_id: ""
		}

		this.former = new Former(this, [])
	}

	getClassGrades = (students: MergeStudentsExams[], grades: MISGrades): GraphData[] => {

		const { class_id, exam_title, subject } = this.state

		// creating grade record object
		let grades_count = Object.keys(grades)
			.reduce((agg, curr) => {
				return {
					...agg,
					[curr]: 0
				}
			}, {})

		// aggregating students marks
		for (const student of students) {

			let marks = { total: 0, obtained: 0 }

			for (const exam of student.merge_exams) {

				const is_class = class_id ? exam.class_id === class_id : true
				const is_exam = exam_title ? exam.name === exam_title : true
				const is_subject = subject ? exam.subject === subject : true

				if (is_class && is_exam && is_subject) {

					marks.obtained += parseFloat(exam.stats.score.toString() || '0')
					marks.total += parseFloat(exam.total_score.toString() || '0')
				}
			}

			const grade = calculateGrade(marks.obtained, marks.total, grades)
			//@ts-ignore
			grades_count[grade] += 1

		}

		// creating data array for graph
		const graph_data = Object.entries(grades_count)
			.reduce((agg, curr) => {
				return [
					...agg,
					{
						grade: curr[0],
						count: curr[1]
					}
				]
			}, []).sort((a, b) => {
				const aPercentage = (grades && grades[a.grade] && grades[a.grade].percent) || '0'
				const bPercentage = (grades && grades[b.grade] && grades[b.grade].percent) || '0'
				return parseInt(aPercentage) - parseInt(bPercentage)
			})

		return graph_data
	}


	render() {

		const { relevant_students, grades, subjects, classes } = this.props

		const graphData = this.getClassGrades(relevant_students, grades)

		return <>
			<div className="class-grades-graph no-print">
				<div className="title">School Grades</div>
				<div className="section-container section">
					<div className="row graph-container">
						<div className="section form graph-filters">
							<div className="row">
								<select {...this.former.super_handle(["class_id"])}>
									<option value="">Select Class</option>
									{
										Object.values(classes)
											.sort((a, b) => a.classYear - b.classYear)
											.map(mis_class => <option key={mis_class.id} value={mis_class.id}>{mis_class.name}</option>)
									}
								</select>
							</div>
							<div className="row">
								<select {...this.former.super_handle(["exam_title"])}>
									<option value="">Select Exam</option>
									{
										ExamTitles
											.map(title => <option key={title} value={title}>{title}</option>)
									}
								</select>
							</div>
							<div className="row">
								<select {...this.former.super_handle(["subject"])}>
									<option value="">Select Subject</option>
									{
										subjects
											.map(subject => <option key={subject} value={subject}>{subject}</option>)
									}
								</select>
							</div>
						</div>
						<div className="grades-graph">
							<BarChart
								width={820}
								height={300}
								data={graphData}>
								<Tooltip />
								<Legend />
								<XAxis dataKey="grade" />
								<YAxis label={{ value: 'Grades Count', angle: -90, position: 'insideLeft', textAnchor: 'end' }} />
								<Bar dataKey="count" name="Final Grades" fill="#8884d8" minPointSize={5} />
							</BarChart>
						</div>
					</div>
				</div>
			</div>
			<div className="section-container section">
				<div className="title">School Grade List</div>
			</div>
		</>
	}
}

export default ClassGradesGraph