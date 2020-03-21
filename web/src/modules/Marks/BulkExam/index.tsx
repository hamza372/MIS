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
import { mergeExam, updateBulkExams, deleteExam } from 'actions/index'
import calculateGrade from 'utils/calculateGrade'
import { EditIcon, DeleteIcon } from 'assets/icons'


import './style.css'
import { Link } from 'react-router-dom'
import Banner from 'components/Banner'

type P = {
	grades: RootDBState["settings"]["exams"]["grades"]
	schoolName: string
	createSingleExam: (exam: CreateExam, class_id: string, section_id: string) => void
	updateBulkExams: (marks_sheet: ExamMarksSheet) => void
	deleteExam: (students_ids: string[], exam_id: string) => void
} & RouteComponentProps & RootDBState

interface S extends ExamFilter {
	section_id: string
	sections: AugmentedSection[]
	show_create_exam: boolean
	exam_marks_sheet: ExamMarksSheet
	banner: MISBanner
}

interface CreateExam extends MISExam {
	student_marks: {
		[id: string]: MISStudentExam
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
			exam_marks_sheet: {},
			banner: {
				active: false,
				good: true,
				text: ""
			}
		}

		this.former = new Former(this, [])
	}

	UNSAFE_componentWillReceiveProps(nextProps: P) {
		const { students, exams } = nextProps
		this.setExamMarksSheetForSection(students, exams)
	}

	getExamFilterConditions = (exam: MISExam): boolean => {

		const { section_id, exam_title, month, year } = this.state

		const is_exam = exam.name === exam_title
		const is_year = moment(exam.date).format("YYYY") === year
		const is_section = exam.section_id === section_id

		const is_month = (exam_title === "Test" && month ? moment(exam.date).format("MMMM") === month : true)

		return is_exam && is_year && is_section && is_month
	}

	getClassIdFromSections = (): string => {

		const { section_id, sections } = this.state
		const section = sections.find(section => section.id === section_id)

		return section ? section.class_id : undefined
	}

	getSubjects = (): string[] => {

		const { classes } = this.props
		const class_id = this.getClassIdFromSections()
		const subjects = classes[class_id] ? classes[class_id].subjects : {}

		return Object.keys(subjects)
	}

	closeCreateExamModal = () => {
		this.setState({ show_create_exam: false }, () => {
			document.body.style.position = ''
		})
	}

	toggleCreateExamModal = () => {

		const { section_id, exam_title } = this.state

		// section id and exam title are compulsory to create new exam
		if (section_id.length === 0 || exam_title.length === 0) {
			alert("Please select class and exam title to create new exam")
			return;
		}

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

	getFilteredExams = (exams: RootDBState["exams"]): MISExam[] => {

		let filtered_exams: MISExam[] = []

		for (const exam of Object.values(exams)) {
			if (this.getExamFilterConditions(exam)) {
				filtered_exams.push(exam)
			}
		}

		return filtered_exams
	}

	setExamMarksSheetForSection = (stundents: RootDBState["students"], exams: RootDBState["exams"]): void => {

		const { section_id, exam_title, year } = this.state

		// do nothing
		if (section_id.length === 0 || exam_title.length === 0 || year.length === 0)
			return

		const merge_students_exams = this.getMergeStudentsExams(stundents, exams)

		const exam_marks_sheet = merge_students_exams.reduce<ExamMarksSheet>((aggStudents, currStudent) => {

			const merge_exams = currStudent.merge_exams

			const student_exams = merge_exams.reduce<{ [id: string]: { edited: boolean } & AugmentedMISExam }>((aggExams, currExam) => {
				return {
					...aggExams,
					[currExam.id]: {
						...currExam,
						edited: false
					}
				}
			}, {})

			return {
				...aggStudents,
				[currStudent.id]: {
					id: currStudent.id,
					name: currStudent.Name,
					rollNo: currStudent.RollNumber,
					exams: student_exams,
				}
			}

		}, {})

		this.setState({ exam_marks_sheet }, () => {
			console.log("state has been updated")
		})
	}

	getMergeStudentsExams = (students: RootDBState["students"], exams: RootDBState["exams"]): MergeStudentsExams[] => {

		const filtered_exams = this.getFilteredExams(exams)

		const merge_student_exams = Object.values(students)
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

		return merge_student_exams
	}

	// accepting score as string here, it is basically for the future use case where we can
	// add options like 'A' for 'Absent' so that when any school print result card, show Absent
	// instead of 0 (zero student got zero in that exam).
	subjectMarksUpdate = (student_id: string, exam_id: string, score: string): void => {

		const { grades } = this.props
		const { exam_marks_sheet } = this.state

		const student = exam_marks_sheet[student_id]
		const exam = student.exams[exam_id]

		// to handle some old exams with total score of type string
		const total_marks = exam ? parseFloat(exam.total_score.toString()) || 0 : 0
		const obtained_marks = parseFloat(score) || 0

		const grade = calculateGrade(obtained_marks, total_marks, grades)
		const remarks = grade && grades && grades[grade] ? grades[grade].remarks : ""

		this.setState({
			exam_marks_sheet: {
				...exam_marks_sheet,
				[student_id]: {
					...student,
					exams: {
						...student["exams"],
						[exam_id]: {
							...exam,
							stats: {
								score: obtained_marks,
								grade,
								remarks
							},
							edited: true
						}
					},
				}
			}
		})
	}

	saveBulkExams = (): void => {

		const { exam_marks_sheet } = this.state
		const students_count = Object.values(exam_marks_sheet).length

		if (students_count === 0) {
			alert("There is nothing to save!")
			return
		}

		if (students_count > 0) {

			this.props.updateBulkExams(exam_marks_sheet)

			this.setState({
				banner: {
					active: true,
					good: true,
					text: "Exam marks sheet has been saved successfully"
				}
			})

			setTimeout(() => { this.setState({ banner: { active: false } }) }, 3000)
		}
	}

	deleteExam = (exam_id: string): void => {

		if (!window.confirm('Are you sure you want to delete the exam?')) {
			return
		}

		const students = Object.values(this.props.students)
			.filter(s => s && s.exams && s.exams[exam_id])
			.map(s => s.id)

		this.setState({
			banner: {
				active: true,
				good: false,
				text: "Exam has been deleted successfully"
			}
		})

		this.props.deleteExam(students, exam_id)

		setTimeout(() => this.setState({ banner: { active: false } }), 3000)
	}

	editExam = (exam: MISExam): void => {
		const { class_id, section_id, id } = exam
		const url = `/reports/${class_id}/${section_id}/exam/${id}`
		window.location.href = url
	}

	render() {

		const { exams, history, students } = this.props

		const { exam_title, section_id, year, show_create_exam, sections, exam_marks_sheet } = this.state

		let years = new Set<string>()
		let filtered_exams: MISExam[] = []

		for (const exam of Object.values(exams)) {

			years.add(moment(exam.date).format("YYYY"))

			if (this.getExamFilterConditions(exam)) {
				filtered_exams.push(exam)
			}
		}

		const subjects = this.getSubjects()

		return <Layout history={history}>
			<div className="bulk-exams">
				{this.state.banner.active && <Banner isGood={this.state.banner.good} text={this.state.banner.text} />}
				<div className="title">Bulk Exams</div>
				<div className="section-container section form">
					<div className="row">
						<label>Class-Section</label>
						<select {...this.former.super_handle(["section_id"], () => true, () => this.setExamMarksSheetForSection(students, exams))}>
							<option value="">Select Class</option>
							{
								sections.map(section => <option key={section.id} value={section.id}>{section ? section.namespaced_name : ''}</option>)
							}
						</select>
					</div>
					<div className="row">
						<label>Exam Year</label>
						<select {...this.former.super_handle(["year"], () => true, () => this.setExamMarksSheetForSection(students, exams))}>
							<option value="">Select Year</option>
							{
								[...years]
									.sort((a, b) => parseInt(b) - parseInt(a))
									.map(year => <option key={year} value={year}>{year}</option>)
							}
						</select>
					</div>
					<div className="row">
						<label>Exam Title</label>
						<select {...this.former.super_handle(["exam_title"], () => true, () => this.setExamMarksSheetForSection(students, exams))}>
							<option value="">Select Exam</option>
							{
								ExamTitles.map(title => <option key={title} value={title}>{title}</option>)
							}
						</select>
					</div>
					{
						exam_title === 'Test' && <div className="row">
							<label>Exam Month</label>
							<select {...this.former.super_handle(["month"])}>
								<option value="">Select Month</option>
								{
									months.map(month => <option key={month} value={month}>{month}</option>)
								}
							</select>
						</div>
					}
					{
						section_id && exam_title && year && <div className="exams">
							<fieldset>
								<legend>Recent Added Exams</legend>
								<RecentAddedExams
									exams={filtered_exams}
									onDeleteExam={this.deleteExam}
									onEditExam={this.editExam} />
								<div className="row">
									<div className="button blue create-exam" onClick={this.toggleCreateExamModal}>Create New Exam</div>
								</div>
							</fieldset>
						</div>
					}
				</div>
				{
					show_create_exam && <Modal>
						<CreateExamModal
							subjects={subjects}
							onCreate={this.onCreateExam}
							onClose={this.closeCreateExamModal} />
					</Modal>
				}
				{
					section_id && exam_title && year && <ExamMarksSheet
						examMarksSheet={exam_marks_sheet}
						exams={filtered_exams}
						onSubjectMarksUpdate={this.subjectMarksUpdate}
						onSaveBulkExams={this.saveBulkExams} />
				}
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
	updateBulkExams: (marks_sheet: ExamMarksSheet) => dispatch(updateBulkExams(marks_sheet)),
	deleteExam: (students_ids: string[], exam_id: string) => dispatch(deleteExam(students_ids, exam_id))
}))(BulkExam)

interface ExamMarksSheetProps {
	examMarksSheet: ExamMarksSheet
	exams: MISExam[]
	onSubjectMarksUpdate: (student_id: string, exam_id: string, score: string) => void
	onSaveBulkExams: () => void
}

const ExamMarksSheet = (props: ExamMarksSheetProps) => {

	const { examMarksSheet, exams, onSubjectMarksUpdate, onSaveBulkExams } = props

	return <>
		<div className="divider">Exams Marks Sheet</div>
		<div className="section-container section">
			<div className="table-wrapper">
				<table>
					<thead>
						<tr>
							<th style={{ width: "10%" }}></th>
							{
								exams
									.sort((a, b) => a.date - b.date)
									.map(exam => {
										return <th key={exam.id}> {exam.subject} <br /> ({exam.total_score}) </th>
									})
							}
						</tr>
					</thead>
					<tbody>
						{
							Object.values(examMarksSheet)
								.sort((a, b) => (parseInt(a.rollNo) || 0) - (parseInt(b.rollNo) || 0))
								.map(student => <tr key={student.id}>
									<td title={toTitleCase(student.name)}><Link to={`/student/${student.id}/profile`}>{student.rollNo || ""} {toTitleCase(student.name.substr(0, 12))}</Link></td>
									{
										Object.entries(student.exams)
											.map(([exam_id, exam]) => <td key={`${exam_id}-${student.id}-${exam.section_id}`}>
												<input onBlur={(e) => onSubjectMarksUpdate(student.id, exam_id, e.target.value)} type="text" placeholder="enter marks" defaultValue={exam.stats.score} />
											</td>)
									}
								</tr>)
						}
					</tbody>
				</table>
			</div>
			<div className="row marks-sheet">
				<div className="button blue" onClick={onSaveBulkExams}>Save Marks Sheet</div>
			</div>
		</div>
	</>
}


interface RecentAddExamsProps {
	exams: MISExam[]
	onDeleteExam: (exam_id: string) => void
	onEditExam: (exam: MISExam) => void
}

const RecentAddedExams = (props: RecentAddExamsProps) => {

	const { exams, onDeleteExam, onEditExam } = props

	return <div className="exams-table">
		<div className="table-row table-header">
			<div className="thead cell">Subject</div>
			<div className="thead cell">Max Score</div>
			<div className="thead cell">Date</div>
			<div className="thead cell" style={{ width: "10%" }}>Edit/Delete</div>
		</div>
		{
			exams
				.sort((a, b) => a.date - b.date)
				.map(exam => <div className="table-row" key={exam.id}>
					<div className="cell">
						<Link to={`/reports/${exam.class_id}/${exam.section_id}/exam/${exam.id}`}>{exam.subject}</Link>
					</div>
					<div className="cell">{exam.total_score}</div>
					<div className="cell">{moment(exam.date).format("DD/MM")}</div>
					<div className="cell" style={{ width: "10%" }}>
						<div className="">
							<img className="edit-icon" src={EditIcon} onClick={() => onEditExam(exam)} alt="edit" />
							<img className="delete-icon" src={DeleteIcon} onClick={() => onDeleteExam(exam.id)} alt="delete" />
						</div>
					</div>
				</div>)
		}
	</div>
}