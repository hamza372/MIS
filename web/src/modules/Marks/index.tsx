import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { getSectionsFromClasses } from 'utils/getSectionsFromClasses'
import Layout from 'components/Layout'
import { RouteComponentProps } from 'react-router'
import Former from 'utils/former';
import moment from 'moment';
import { EditIcon, DeleteIcon } from 'assets/icons'
import getStudentExamMarksSheet from 'utils/studentExamMarksSheet'
import chunkify from 'utils/chunkify'
import { ClassResultSheet } from 'components/Printable/ResultCard/classResultSheet'
import { deleteExam } from 'actions'
import queryString from 'query-string'
import months from 'constants/months'
import { ExamTitles } from 'constants/exam'

import './style.css'

type propsType = {
	classes: RootDBState["classes"]
	students: RootDBState["students"]
	exams: RootDBState["exams"]
	grades: RootDBState["settings"]["exams"]["grades"]
	schoolName: string

	deleteExam: (students: Array<string>, exam_id: string) => void

} & RouteComponentProps

type S = {
	section_id: string
	exam_title: string
	year: string
	month: string
	banner: {
		active: boolean
		good?: boolean
		text?: string
	}
}

class Reports extends Component<propsType, S> {

	former: Former
	constructor(props: propsType) {
		super(props)

		const parsed_query = queryString.parse(this.props.location.search)

		const section_id = parsed_query.section_id ? parsed_query.section_id.toString() : ''
		const exam_title = parsed_query.exam_title ? parsed_query.exam_title.toString() : ''
		const year = parsed_query.year ? parsed_query.year.toString() : moment().format("YYYY")
		const month = parsed_query.month ? parsed_query.month.toString() : ''

		this.state = {
			section_id,
			exam_title,
			year,
			month,
			banner: {
				active: false,
				good: false,
				text: ''
			}
		}

		this.former = new Former(this, [])
	}

	deleteExam = (exam_id: string): void => {

		if (!window.confirm('Are you sure you want to delete?')) {
			return
		}

		const students = Object.values(this.props.students)
			.filter(s => s && s.exams && s.exams[exam_id])
			.map(s => s.id)

		this.setState({
			banner: {
				active: true,
				good: false,
				text: "Exam Deleted"
			}
		})

		this.props.deleteExam(students, exam_id)

		setTimeout(() => this.setState({ banner: { active: false } }), 3000)

	}

	editExam = (exam: MISExam): void => {
		const { class_id, section_id, id } = exam
		const url = `/reports/${class_id}/${section_id}/exam/${id}`

		// redirect to edit exam page
		window.location.href = url
	}

	createNewExam = (): void => {

		const { section_id } = this.state

		if (section_id === '') {
			alert("Please select class first!")
			return
		}

		const class_id = this.getClassID(section_id)
		const url = `/reports/${class_id}/${section_id}/new`

		// redirect to create new exam page
		window.location.href = url
	}

	createBulkExams = (): void => {
		const url = "/reports/bulk-exams"
		window.location.href = url
	}

	getClassID = (section_id: string) => {
		const { classes } = this.props

		return Object.values(classes)
			.find(c => c.sections[section_id] ? true : false).id
	}

	renderClassResultSheet = (section: AugmentedSection) => {

		const { exam_title, year, month, section_id } = this.state
		const { exams, students, grades, schoolName } = this.props

		const chunkSize = 22
		let filtered_exams: MISExam[] = []

		for (const exam of Object.values(exams)) {

			if (exam.name === exam_title && moment(exam.date).format("YYYY") === year && exam.section_id === section_id &&
				(exam_title === "Test" && month ? moment(exam.date).format("MMMM") === month : true)) {
				filtered_exams.push(exam)
			}
		}

		const exam_students = Object.values(students)
			.filter(student => student && student.Name && student.section_id && student.exams)
			.reduce<MergeStudentsExams[]>((agg, curr) => {

				const merge_exams: AugmentedMISExam[] = []

				for (const exam of filtered_exams) {
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

		const marks_sheet = getStudentExamMarksSheet(exam_students, grades)

		return chunkify(marks_sheet, chunkSize)
			.map((chunkItems: StudentMarksSheet[], index: number) => <ClassResultSheet key={index}
				sectionName={section ? section.namespaced_name : ''}
				relevant_exams={filtered_exams}
				examName={exam_title}
				schoolName={schoolName}
				students={chunkItems}
				chunkSize={index === 0 ? 0 : chunkSize * index} />)

	}

	onStateChange = () => {

		const { section_id, exam_title, year, month } = this.state

		const url = '/reports'
		let params = `section_id=${section_id}&exam_title=${exam_title}&year=${year}`

		if (exam_title === "Test")
			params = params + `&month=${month}`

		window.history.replaceState(this.state, "Grade Book", `${url}?${params}`)
	}

	UNSAFE_componentWillReceiveProps(nextProps: propsType) {

		const parsed_query = queryString.parse(nextProps.location.search)

		const section_id = parsed_query.section_id ? parsed_query.section_id.toString() : ''
		const exam_title = parsed_query.exam_title ? parsed_query.exam_title.toString() : ''
		const year = parsed_query.year ? parsed_query.year.toString() : ''
		const month = parsed_query.month ? parsed_query.month.toString() : ''

		this.setState({
			section_id,
			exam_title,
			year,
			month
		})
	}

	render() {

		const { section_id, exam_title, year, month } = this.state
		const { classes, exams } = this.props

		const sections = getSectionsFromClasses(classes)
			.sort((a, b) => (a.classYear || 0) - (b.classYear || 0))

		const curr_section = sections.find(section => section.id === section_id)

		let filtered_exams: MISExam[] = []
		let years = new Set<string>()

		for (const [, exam] of Object.entries(exams)) {

			years.add(moment(exam.date).format("YYYY"))

			if (exam
				&& exam.id
				&& exam.section_id === section_id
				&& moment(exam.date).format("YYYY") === year
				&& (exam_title === "Test" && month !== "" ? moment(exam.date).format("MMMM") === month : true)) {
				filtered_exams.push(exam)
			}
		}

		return <Layout history={this.props.history}>
			<div className="reports-page no-print">
				<div className="title">Grade Book</div>
				<div className="form section exams-filter">
					<div className="table">
						<div className="row">
							<label>Class/Section</label>
							<select {...this.former.super_handle(["section_id"], () => true, this.onStateChange)}>
								<option value="">Select Section</option>
								{
									sections.map(section => <option key={section.id} value={section.id}>{section.namespaced_name}</option>)
								}
							</select>
						</div>
						<div className="row">
							<label>Exams for Year</label>
							<select {...this.former.super_handle(["year"], () => true, this.onStateChange)}>
								<option value="">Select Year</option>
								{
									Array.from(years)
										.sort((a, b) => parseInt(b) - parseInt(a))
										.map(year => <option key={year} value={year}>{year}</option>)
								}
							</select>
						</div>
						<div className="row">
							<label>Exam Title</label>
							<select {...this.former.super_handle(["exam_title"], () => true, this.onStateChange)}>
								<option value="">Select Exam</option>
								{
									ExamTitles.map(title => <option key={title} value={title}>{title}</option>)
								}
							</select>
						</div>
						{
							this.state.exam_title === "Test" && <div className="row">
								<label>Test Month</label>
								<select {...this.former.super_handle(["month"], () => true, this.onStateChange)}>
									<option value="">Select Month</option>
									{
										months.map(month => <option key={month} value={month}>{month}</option>)
									}
								</select>
							</div>
						}
					</div>
					<div className="row create-exam">
						<div className="button blue create-exam" onClick={this.createBulkExams}>Create Bulk Exams</div>
					</div>
				</div>
				{
					exam_title && year && <div className="section exams-list">
						<fieldset>
							<legend>{exam_title.toUpperCase()}</legend>
							<div className="exams-table">
								<div className="table-row table-header">
									<div className="thead cell">Subject</div>
									<div className="thead cell">Max Score</div>
									<div className="thead cell">Date</div>
									<div className="thead cell" style={{ width: "10%" }}>Edit/Delete</div>
								</div>
								{
									filtered_exams
										.filter(exam => exam.name === exam_title)
										.sort((a, b) => a.subject.localeCompare(b.subject))
										.map(exam => <div className="table-row" key={exam.id}>
											<div className="cell">
												<Link to={`/reports/${exam.class_id}/${exam.section_id}/exam/${exam.id}`}>{exam.subject}</Link>
											</div>
											<div className="cell">{exam.total_score}</div>
											<div className="cell">{moment(exam.date).format("DD/MM")}</div>
											<div className="cell" style={{ width: "10%" }}>
												<div className="">
													<img className="edit-icon" src={EditIcon} onClick={() => this.editExam(exam)} alt="edit" />
													<img className="delete-icon" src={DeleteIcon} onClick={() => this.deleteExam(exam.id)} alt="delete" />
												</div>
											</div>
										</div>)
								}
							</div>
						</fieldset>
						<div className="row">
							<div className="button grey" onClick={() => window.print()} style={{ marginRight: 5 }}>Print Result Sheet</div>
							<div className="button blue" onClick={() => this.createNewExam()}>Create New Exam</div>
						</div>
					</div>
				}
			</div>
			{
				section_id && exam_title && year && <div className="print-only">{this.renderClassResultSheet(curr_section)}</div>
			}
		</Layout>
	}
}

export default connect((state: RootReducerState) => ({
	classes: state.db.classes,
	students: state.db.students,
	exams: state.db.exams,
	grades: state.db.settings.exams.grades,
	schoolName: state.db.settings.schoolName
}), (dispatch: Function) => ({
	deleteExam: (students: Array<string>, exam_id: string) => dispatch(deleteExam(students, exam_id))
}))(Reports)
