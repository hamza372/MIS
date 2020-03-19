import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import Former from 'utils/former'
import { ExamTitles } from 'constants/exam'
import StudentsPerformance from './Graphs/studentsPerformance'

import './style.css'

type P = {
	grades: MISGrades
} & RootDBState

type S = {
	class_id: string
	section_id: string
	subject: string
	toggleFilter: boolean
	exam_title: string
	min_date: number
	max_date: number
}

class ExamsAnalytics extends Component<P, S> {
	former: Former
	constructor(props: P) {
		super(props)

		const min_date = moment().subtract(1, "year").unix() * 1000
		const max_date = moment().unix() * 1000

		const students_class = Object.values(this.props.classes || {})
			.sort((a, b) => (a.classYear || 0) - (b.classYear || 0))[0]

		const class_id = students_class ? students_class.id : ''

		this.state = {
			exam_title: "",
			min_date,
			max_date,
			class_id,
			subject: "",
			section_id: "",
			toggleFilter: false,
		}
		this.former = new Former(this, [])
	}

	onToggleFilter = () => {
		this.setState({ toggleFilter: !this.state.toggleFilter })
	}

	getMergeStudentsExams = (students: P["students"], exams: MISExam[]): MergeStudentsExams[] => {

		return Object.values(students)
			.filter(student => student && student.Name && student.exams)
			.reduce<MergeStudentsExams[]>((agg, curr) => {

				const merge_exams: AugmentedMISExam[] = []

				for (const exam of exams) {
					const stats = curr.exams[exam.id]
					if (stats != null) {
						merge_exams.push({ ...exam, stats })
					}
				}

				// in case there is no exams for the curr student, no need to put into list
				if (merge_exams.length === 0)
					return agg

				return [...agg, { ...curr, merge_exams }]

			}, [])
	}

	isBetweenDateRange = (exam_date: number): boolean => {

		const { min_date, max_date } = this.state

		return moment(exam_date).isBetween(moment(min_date), moment(max_date), "day")
	}

	checkFilterConditions = (exam: MISExam): boolean => {

		const { class_id, exam_title, subject } = this.state

		const is_class = class_id ? exam.class_id === class_id : true
		const is_exam = exam_title ? exam.name === exam_title : true
		const is_subject = subject ? exam.subject === subject : true

		return is_class && is_exam && is_subject && this.isBetweenDateRange(exam.date)
	}

	render() {

		const { exams, classes, students, grades } = this.props

		const { class_id, min_date, max_date, toggleFilter } = this.state

		const students_class = classes && classes[class_id]

		let years = new Set<string>()
		let filtered_exams: MISExam[] = []
		let subjects = new Set<string>()

		for (const exam of Object.values(exams)) {

			years.add(moment(exam.date).format("YYYY"))

			if (this.checkFilterConditions(exam)) {
				filtered_exams.push(exam)
			}

			// add class subject if class selected, else add all subjects for all classes
			if (class_id ? exam.class_id === class_id : true) {
				subjects.add(exam.subject)
			}
		}

		const students_exams = this.getMergeStudentsExams(students, filtered_exams)

		return <div className="exams-analytics">
			<div className="row filter-button no-print">
				<button className="button green" onClick={this.onToggleFilter}>{toggleFilter ? "Hide Filters" : "Show Filters"}</button>
			</div>
			{
				toggleFilter && <div className="no-print">
					<div className="section form">
						<div className="row">
							<label>Exams for Class</label>
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
							<label>Exam</label>
							<select {...this.former.super_handle(["exam_title"])}>
								<option value="">Select Exam</option>
								{
									ExamTitles
										.map(title => <option key={title} value={title}>{title}</option>)
								}
							</select>
						</div>
						<div className="row">
							<label>Subject</label>
							<select {...this.former.super_handle(["subject"])}>
								<option value="">Select Subject</option>
								{
									[...subjects]
										.map(subject => <option key={subject} value={subject}>{subject}</option>)
								}
							</select>
						</div>
						<div className="row">
							<label>Exams Date Range(Start Date - End Date)</label>
							<div>
								<div className="date-range">
									<input type="date" {...this.former.super_handle(["min_date"])} value={moment(min_date).format("YYYY-MM-DD")} />
									<span style={{ margin: 10 }}>-</span>
									<input type="date" {...this.former.super_handle(["max_date"])} value={moment(max_date).format("YYYY-MM-DD")} />
								</div>
							</div>
						</div>
					</div>
				</div>
			}

			{
				students_exams.length > 0 && <>
					<StudentsPerformance
						key={`${this.state.class_id}-${this.state.exam_title}-${this.state.subject}-${this.state.max_date}-${this.state.min_date}`}
						relevant_students={students_exams}
						students_class={students_class}
						grades={grades} />
				</>
			}
		</div>
	}
}

export default connect((state: RootReducerState) => ({
	students: state.db.students,
	classes: state.db.classes,
	settins: state.db.settings,
	grades: state.db.settings.exams.grades,
	exams: state.db.exams,
	faculty: state.db.faculty
}))(ExamsAnalytics)