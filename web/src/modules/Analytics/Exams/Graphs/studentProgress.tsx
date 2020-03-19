import React, { Component } from 'react'
import { XAxis, YAxis, Tooltip, LineChart, CartesianGrid, Line, Label } from 'recharts'
import moment from 'moment'
import getStudentExamMarksSheet from 'utils/studentExamMarksSheet'
import { ExamTitles } from 'constants/exam'
import Former from 'utils/former'


type PropsType = {
	relevant_students: MergeStudentsExams[]
	years: string[]
	grades: MISGrades
}

type S = {
	student_id: string
	student_type: "BEST_STUDENT" | "POOR_STUDENT" | string
} & ExamFilter


const colors = ["#8884d8", "#82ca9d", "#413ea0", "#ff7300", "#ff0660"]

class StudentProgressGraph extends Component<PropsType, S> {
	former: Former
	constructor(props: PropsType) {
		super(props)
		this.state = {
			student_id: "",
			exam_title: "",
			student_type: "BEST_STUDENT",
			year: "",
		}

		this.former = new Former(this, [])
	}

	getStudentExamsMarks = (students: MergeStudentsExams[], grades: MISGrades, years: string[]) => {

		const { student_id, student_type } = this.state

		const marks_sheet = getStudentExamMarksSheet(students, grades)

		// get the best or poor student
		let student = student_type === "BEST_STUDENT" ? marks_sheet[0] : marks_sheet.slice(-1)[0]

		// student selected from list
		if (student_id) {
			student = marks_sheet.find(student => student.id === student_id)
		}

		const graph_data = years.reduce((agg, curr) => {

			// creating grade record object
			let examsObject = ExamTitles
				.reduce((agg, curr) => {
					return {
						...agg,
						[curr]: 0
					}
				}, {})

			for (const exam of student.merge_exams) {

				if (moment(exam.date).format("YYYY") === curr) {
					//@ts-ignore
					examsObject[exam.name] += parseFloat(exam.stats.score.toString() || '0')
				}
			}
			return [
				...agg,
				{
					year: curr,
					...examsObject
				}
			]
		}, [])

		return { graphData: graph_data, student }

	}

	render() {

		const { years, grades, relevant_students } = this.props

		const { graphData, student } = this.getStudentExamsMarks(relevant_students, grades, years)

		return <>
			<div className="student-progress-graph">
				<div className="title divider">Student Progress in Exams</div>
				<div className="section-container section">
					<div className="row graph-container">
						<div className="section form graph-filters">
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
								<select {...this.former.super_handle(["student_type"])}>
									<option value="">Select Class</option>
									<option value="BEST_STUDENT">Best Student</option>
									<option value="POOR_STUDENT">Poor Student</option>
								</select>
							</div>
							<div className="row">
								<select {...this.former.super_handle(["student_id"])}>
									<option value="">Select Stundent</option>
									{
										relevant_students
											.map(student => <option key={student.id} value={student.id}>{student.Name}</option>)
									}
								</select>
							</div>
						</div>
						<div className="grades-graph">
							<LineChart width={820} height={250} data={graphData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="year">
									<Label value={student.name} offset={0} position="insideBottom" />
								</XAxis>
								<YAxis />
								<Tooltip />
								{
									ExamTitles
										.map((title: string, i: number) => <Line key={title} type="monotone" dataKey={title} strokeWidth={2} stroke={colors[i]} />)
								}
							</LineChart>
						</div>
					</div>
				</div>
			</div>
		</>
	}
}

export default StudentProgressGraph
