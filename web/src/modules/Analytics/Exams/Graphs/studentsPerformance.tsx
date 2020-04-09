import React, { Component } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getSingleStudentExamMarksSheet } from 'utils/studentExamMarksSheet'
import { StudentsPerformanceList } from 'components/Printable/ResultCard/studentPerformance'
import chunkify from 'utils/chunkify'
import { Link } from 'react-router-dom'
import calculateGrade from 'utils/calculateGrade'
import { ProgressBar } from 'components/ProgressBar'
import Former from 'utils/former'

type PropsType = {
	relevant_students: MergeStudentsExams[]
	grades: MISGrades
	students_class: MISClass
}

type GraphData = {
	total_marks: number
	marks_obtained: number
	percentage: number
} & StudentMarksSheet

interface S {
	loading: boolean
	graph_data: GraphData[]
	loading_percentage: number
	student_name: string
}

const CHUNK_SIZE = 22

class StudentsPerformance extends Component<PropsType, S> {

	background_calculation: NodeJS.Timeout

	former: Former
	constructor(props: PropsType) {
		super(props)

		this.state = {
			loading: true,
			loading_percentage: 0,
			graph_data: [],
			student_name: ''
		}

		this.former = new Former(this, [])
	}

	componentWillUnmount() {
		clearTimeout(this.background_calculation)
	}

	componentDidMount() {
		this.calculate()
	}

	calculate = () => {

		const { relevant_students, grades } = this.props

		let i = 0;
		clearTimeout(this.background_calculation)

		let graph_data: GraphData[] = []

		const reducify = () => {

			// set the percentage bar every 10% change
			const interval = Math.floor(relevant_students.length / 10)
			if (i % interval === 0) {
				this.setState({
					loading_percentage: (i / relevant_students.length) * 100
				})
			}

			if (i >= relevant_students.length) {

				const sorted_data = graph_data.sort((a, b) => a.percentage - b.percentage)

				// we are done calculating
				this.setState({
					loading: false,
					loading_percentage: 0,
					graph_data: sorted_data
				})
			}

			const student = relevant_students[i]
			i += 1

			if (!student || !student.Name) {
				this.background_calculation = setTimeout(reducify, 0)
				return;
			}

			// first, get their exam marks sheet.
			const marks_sheet = getSingleStudentExamMarksSheet(student, grades)

			graph_data.push({
				id: student.id,
				name: student.Name,
				manName: student.ManName,
				rollNo: student.RollNumber,
				marks_obtained: marks_sheet.marks.obtained,
				total_marks: marks_sheet.marks.total,
				grade: calculateGrade(marks_sheet.marks.obtained, marks_sheet.marks.total, grades),
				percentage: this.getPercentage(marks_sheet.marks.obtained, marks_sheet.marks.total)
			})

			this.background_calculation = setTimeout(reducify, 0)
		}

		this.background_calculation = setTimeout(reducify, 0)

	}

	getPercentage = (marks_obtained: number, total_marks: number): number => {

		const percentage = (marks_obtained / total_marks) * 100

		return parseFloat(percentage.toFixed(2))
	}

	/*
	getStudentsExamsData = (students: MergeStudentsExams[], grades: MISGrades): GraphData[] => {

		const marks_sheet = getStudentExamMarksSheet(students, grades)

		const graph_data = marks_sheet.reduce<GraphData[]>((agg, curr) => {

			let marks = { total: 0, obtained: 0 }

			for (const exam of curr.merge_exams) {

				marks.obtained += parseFloat(exam.stats.score.toString() || '0')
				marks.total += parseFloat(exam.total_score.toString() || '0')
			}

			return [
				...agg,
				{
					id: curr.id,
					name: curr.name,
					manName: curr.manName,
					rollNo: curr.rollNo,
					marks_obtained: marks.obtained,
					total_marks: marks.total,
					grade: calculateGrade(marks.obtained, marks.total, grades),
					percentage: this.getPercentage(marks.obtained, marks.total)
				}
			]
		}, [])

		return graph_data
	}
	*/

	render() {

		if (this.state.loading) {
			return <ProgressBar percentage={this.state.loading_percentage} />
		}

		const { students_class } = this.props

		// extremely expensive
		const graph_data = this.state.graph_data

		const name = this.state.student_name

		const table_data = graph_data
			.filter(s => name ? s.name.toLocaleLowerCase().includes(name.toLocaleLowerCase()) : true)

		return <>
			<div className="school-grades-graph no-print">
				<div className="title divider">Students Position Graph</div>
				<div className="section">
					<ResponsiveContainer width="100%" height={280}>
						<BarChart data={graph_data} barSize={5}>
							<XAxis dataKey="percentage" type="category" />
							<YAxis />
							<Tooltip content={BarLabel} />
							<Bar dataKey="percentage" fill="#74aced" />
						</BarChart>
					</ResponsiveContainer>
				</div>

				<div className="divider">Students Position List</div>
				<div className="section">
					<div className="row">
						<input
							className="search-bar"
							type="text"
							{...this.former.super_handle(["student_name"])}
							placeholder="search"
						/>
					</div>
					<div className="table row">
						<label><b>Name</b></label>
						<label><b>Marks</b></label>
						<label><b>Percentage</b></label>
						<label><b>Grade</b></label>
					</div>
					{
						// to avoid sorting the data in descending order again,
						// accessing items in reverse order from sorted data
						table_data
							.map((_, i: number) => {

								const student = table_data[table_data.length - 1 - i]

								return <div className="table row" key={student.id}>
									<Link to={`/student/${student.id}/marks`}>{student.name}</Link>
									<div>{student.marks_obtained}/{student.total_marks}</div>
									<div>{student.percentage}%</div>
									<div>{student.grade}</div>
								</div>
							})
					}
					<div className="print button" onClick={() => window.print()} style={{ marginTop: "10px" }}>Print</div>
				</div>
			</div>
			{
				chunkify(table_data, CHUNK_SIZE, true)
					.map((chunk_items: GraphData[], i: number) => <StudentsPerformanceList key={i}
						students_class={students_class}
						items={chunk_items}
						schoolName={""}
						chunkSize={i === 0 ? 0 : CHUNK_SIZE * i}
					/>)
			}
		</>
	}
}

interface BarLabelProps {
	payload: { payload: GraphData }[]
	active: boolean
}

const BarLabel: React.SFC<BarLabelProps> = ({ payload, active }) => {

	if (active) {

		const student = payload[0].payload

		return <div className="custom-tooltip form">
			<div className="row">
				<label>Name:</label>
				<div>{student.name}</div>
			</div>
			<div className="row">
				<label>Father Name:</label>
				<div>{student.manName}</div>
			</div>
			<div className="row">
				<label>Percent:</label>
				<div>{student.percentage}</div>

			</div>
			<div className="row">
				<label>Grade</label>
				<div>{student.grade}</div>
			</div>
		</div>
	}
}

export default StudentsPerformance