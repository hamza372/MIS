import React, { Component } from 'react'
import { RouteComponentProps } from 'react-router'
import { connect } from 'react-redux'
import Former from 'utils/former'
import getSectionsFromClasses from 'utils/getSectionsFromClasses'
import Layout from 'components/Layout'
import { ExamTitles } from 'constants/exam'
import { v4 } from 'node-uuid'
import toTitleCase from 'utils/toTitleCase'
import moment from 'moment'
import months from 'constants/months'
import Modal from 'components/Modal'
import CreateExamModal from './createExamModal'
import { mergeExam } from 'actions/index'

import './style.css'

type P = {
	grades: RootDBState["settings"]["exams"]["grades"]
	schoolName: string

	createSingleExam: (exam: CreateExam, class_id: string, section_id: string) => void

} & RouteComponentProps & RootDBState

interface S extends ExamFilter {
	section_id: string
	sections: AugmentedSection[]
	show_create_exam: boolean
	exam_marks_sheet: ExamMarksSheet
}

interface CreateExam extends MISExam {
	student_marks: {
		[id: string]: MISStudentExam
	}
}

interface ExamMarksSheet {
	[studentId: string]: {
		id: string
		name: string
		rollNo: string
		exams: {
			[examId: string]: MISStudentExam
		}
	}
}

function blankExam() {
	return {
		id: v4(),
		name: "",
		subject: "",
		total_score: "",
		date: new Date().getTime(),
		student_marks: {}
	}
}

class BulkExam extends Component<P, S> {
	former: Former
	constructor(props: P) {
		super(props)

		const year = moment().format("YYYY")
		const sections = getSectionsFromClasses(this.props.classes)
			.sort((a, b) => (a.classYear || 0) - (b.classYear || 0))

		this.state = {
			section_id: "",
			exam_title: "",
			year,
			month: '',
			show_create_exam: false,
			sections,
			exam_marks_sheet: {}
		}

		this.former = new Former(this, [])
	}

	getClassIdFromSections = (): string => {

		const { section_id, sections } = this.state
		const section = sections.find(section => section.id === section_id)

		return section ? section.class_id : undefined
	}

	onCloseCreateExamModal = () => {
		this.setState({ show_create_exam: false }, () => {
			document.body.style.position = ''
		})
	}

	getSubjects = (): string[] => {

		const { classes } = this.props
		const class_id = this.getClassIdFromSections()
		const subjects = classes[class_id] ? classes[class_id].subjects : {}

		return Object.keys(subjects)
	}


	toggleCreateExamModal = () => {
		this.setState({ show_create_exam: !this.state.show_create_exam }, () => {
			if (this.state.show_create_exam === true) {
				document.body.style.position = 'fixed'
			}
		})
	}

	onCreateExam = (subject: string, total_score: number, date: number): void => {

		const { students } = this.props
		const { section_id, exam_title } = this.state

		const class_id = this.getClassIdFromSections()

		const student_marks = Object.entries(students)
			.filter(([_, student]) => student && student.Name && student.section_id === section_id)
			.reduce((agg, [id, _]) => ({ ...agg, [id]: { score: "", grade: "", remarks: "" } }), {})

		const prepare_exam: CreateExam = {
			...blankExam(),
			name: exam_title,
			class_id,
			section_id,
			subject,
			total_score,
			date,
			student_marks
		}

		this.props.createSingleExam(prepare_exam, class_id, section_id)
	}

	getFilteredExams = (): MISExam[] => {

		const { section_id, exam_title, month, year } = this.state

		const { exams } = this.props

		let filtered_exams: MISExam[] = []

		for (const exam of Object.values(exams)) {
			if (exam.name === exam_title && moment(exam.date).format("YYYY") === year &&
				exam.section_id === section_id &&
				(exam_title === "Test" && month ? moment(exam.date).format("MMMM") === month : true)) {
				filtered_exams.push(exam)
			}
		}

		return filtered_exams
	}

	onSectionSelect = () => {

		const merge_students_exams = this.getMergeStudentsExams()

		const exam_marks_sheet = merge_students_exams.reduce<ExamMarksSheet>((aggStudents, currStudent) => {

			const merge_exams = currStudent.merge_exams

			const student_exams = merge_exams.reduce<{ [id: string]: MISStudentExam }>((agg, curr) => {
				return {
					...agg,
					[curr.id]: curr.stats
				}
			}, {})

			return {
				...aggStudents,
				[currStudent.id]: {
					id: currStudent.id,
					name: currStudent.Name,
					rollNo: currStudent.RollNumber,
					exams: student_exams
				}
			}

		}, {})

		this.setState({ exam_marks_sheet }, () => {
			return;
		})
	}

	getMergeStudentsExams = (): MergeStudentsExams[] => {

		const filtered_exams = this.getFilteredExams()

		const { students } = this.props

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

		return exam_students
	}

	onSubjectMarksChange = (student_id: string, exam_id: string, score: string) => {

		const { exam_marks_sheet } = this.state

		this.setState({
			exam_marks_sheet: {
				...exam_marks_sheet,
				[student_id]: {
					...exam_marks_sheet[student_id],
					exams: {
						...exam_marks_sheet[student_id]["exams"],
						[exam_id]: {
							...exam_marks_sheet[student_id]["exams"][exam_id],
							score: parseFloat(score) || 0
						}
					}
				}
			}
		})
	}

	onSaveBulkExams = (): void => {

	}

	render() {

		const { exams, history } = this.props

		const { exam_title, section_id, year, month, show_create_exam, sections, exam_marks_sheet } = this.state


		let years = new Set<string>()
		let filtered_exams: MISExam[] = []

		for (const exam of Object.values(exams)) {

			years.add(moment(exam.date).format("YYYY"))

			if (exam.name === exam_title && moment(exam.date).format("YYYY") === year &&
				exam.section_id === section_id &&
				(exam_title === "Test" && month ? moment(exam.date).format("MMMM") === month : true)) {
				filtered_exams.push(exam)
			}
		}

		const subjects = this.getSubjects()

		return <Layout history={history}>
			<div className="bulk-exams">
				<div className="title">Bulk Exams</div>
				<div className="section-container section form">
					<div className="row">
						<label>Class-Section</label>
						<select {...this.former.super_handle(["section_id"], () => true, () => this.onSectionSelect())}>
							<option value="">Select Class</option>
							{
								sections.map(section => <option key={section.id} value={section.id}>{section ? section.namespaced_name : ''}</option>)
							}
						</select>
					</div>
					<div className="row">
						<label>Exam Year</label>
						<select {...this.former.super_handle(["year"], () => true, () => this.onSectionSelect())}>
							<option value="">Select Year</option>
							{
								[...years].map(year => <option key={year} value={year}>{year}</option>)
							}
						</select>
					</div>
					<div className="row">
						<label>Exam Title</label>
						<select {...this.former.super_handle(["exam_title"], () => true, () => this.onSectionSelect())}>
							<option value="">Select Exam</option>
							{
								ExamTitles.map(title => <option key={title} value={title}>{title}</option>)
							}
						</select>
					</div>
					{
						exam_title === 'Test' && <div className="row">
							<label>Exam Month</label>
							<select {...this.former.super_handle(["year"])}>
								<option value="">Select Month</option>
								{
									months.map(month => <option key={month} value={month}>{month}</option>)
								}
							</select>
						</div>
					}
					<div className="row">
						<div className="button blue" style={{ padding: "10px 15px", marginTop: 12 }} onClick={this.toggleCreateExamModal}>Create New Exam</div>
					</div>
				</div>
				{
					show_create_exam && <Modal>
						<CreateExamModal
							subjects={subjects}
							onCreate={this.onCreateExam}
							onClose={this.onCloseCreateExamModal} />
					</Modal>
				}
				<div className="divider">Exams Marks Sheet</div>
				<div className="section-container section">
					<div className="table-wrapper">
						<table>
							<thead>
								<tr>
									<th style={{ width: "10%" }}></th>
									{
										filtered_exams
											.sort((a, b) => a.date - b.date)
											.map(exam => {
												return <th key={exam.id}> {exam.subject} <br /> ( {exam.total_score} ) </th>
											})
									}
								</tr>
							</thead>
							<tbody>
								{
									Object.values(exam_marks_sheet)
										.map(student => <tr key={student.id}>
											<td>{student.rollNo || ""} {toTitleCase(student.name.substr(0, 12))}</td>
											{
												Object.entries(student.exams)
													.map(exam => <td key={exam[0] + "-" + student.id}>
														<input onChange={(e) => this.onSubjectMarksChange(student.id, exam[0], e.target.value)} type="number" placeholder="enter marks" value={exam[1].score} />
													</td>)
											}
										</tr>)
								}
							</tbody>
						</table>
					</div>
					<div className="row" style={{ marginTop: 20, justifyContent: "flex-end" }}>
						<div className="button grey" style={{ padding: "10px 15px", marginRight: "2px" }}>Print Marks Sheet</div>
						<div className="button blue" style={{ padding: "10px 15px" }}>Save Marks Sheet</div>
					</div>
				</div>
			</div>
		</Layout>
	}
}

export default connect((state: RootReducerState) => ({
	students: state.db.students,
	classes: state.db.classes,
	exams: state.db.exams || {},
	grades: state.db.settings.exams.grades,
	settings: state.db.settings,
	schoolName: state.db.settings.schoolName
}), (dispatch: Function) => ({
	createSingleExam: (exam: CreateExam, class_id: string, section_id: string) => dispatch(mergeExam(exam, class_id, section_id)),
}))(BulkExam)