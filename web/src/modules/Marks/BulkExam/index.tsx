import React, { Component } from 'react'
import { RouteComponentProps } from 'react-router'
import { connect } from 'react-redux'
import Former from 'utils/former'
import getSectionsFromClasses from 'utils/getSectionsFromClasses'
import Layout from 'components/Layout'
import { ExamTitles } from 'constants/exam'

import './style.css'
import toTitleCase from 'utils/toTitleCase'
import moment from 'moment'
import months from 'constants/months'
import Modal from 'components/Modal'
import CreateExamModal from './createExamModal'

type P = {
	grades: RootDBState["settings"]["exams"]["grades"]
	schoolName: string
} & RouteComponentProps & RootDBState


type S = {
	section_id: string
	show_create_exam: boolean
} & ExamFilter

class BulkExam extends Component<P, S> {
	former: Former
	constructor(props: P) {
		super(props)

		const year = moment().format("YYYY")

		this.state = {
			section_id: "9bbdc949-d158-476e-8df0-e15482029795",
			exam_title: "Final-Term",
			year,
			month: '',
			show_create_exam: false
		}

		this.former = new Former(this, [])
	}

	getClassIdFromSections = (sections: AugmentedSection[]): string => {

		const { section_id } = this.state
		const section = sections.find(section => section.id === section_id)

		return section ? section.class_id : undefined
	}

	getSubjects = (sections: AugmentedSection[]): string[] => {

		const { classes } = this.props
		const class_id = this.getClassIdFromSections(sections)
		const subjects = classes[class_id] ? classes[class_id].subjects : {}

		return Object.keys(subjects)
	}


	toggleCreateExamModal = () => {
		this.setState({ show_create_exam: !this.state.show_create_exam }, () => {
			// When the modal is shown, we want a fixed body
			if (this.state.show_create_exam === true) {
				document.body.style.position = 'fixed'
			}
		})
	}

	onCloseCreateExamModal = () => {
		this.setState({ show_create_exam: false }, () => {
			// When the modal is hidden
			document.body.style.position = ''
		})
	}

	onCreateExam = (subject: string, total_score: number, date: number): string => {

		const { section_id, exam_title } = this.state

		return ""
	}

	onSaveBulkExams = (): void => {

	}

	render() {

		const { students, classes, exams, grades, settings, schoolName, history } = this.props

		const { exam_title, section_id, year, month, show_create_exam } = this.state

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

		const sections = getSectionsFromClasses(classes)
		const subjects = this.getSubjects(sections)

		return <Layout history={history}>
			<div className="bulk-exams">
				<div className="title">Bulk Exams</div>
				<div className="section-container section form">
					<div className="row">
						<label>Class-Section</label>
						<select {...this.former.super_handle(["section_id"], () => true, () => this.getSubjects(sections))}>
							<option value="">Select Class</option>
							{
								sections.map(section => <option key={section.id} value={section.id}>{section ? section.namespaced_name : ''}</option>)
							}
						</select>
					</div>
					<div className="row">
						<label>Exam Year</label>
						<select {...this.former.super_handle(["year"])}>
							<option value="">Select Year</option>
							{
								[...years].map(year => <option key={year} value={year}>{year}</option>)
							}
						</select>
					</div>
					<div className="row">
						<label>Exam Title</label>
						<select {...this.former.super_handle(["exam_title"])}>
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
										subjects
											.map(subject => <th key={subject}>{subject}</th>)
									}
								</tr>
							</thead>
							<tbody>
								{
									Object.values(students)
										.filter(student => student && student.Name && student.section_id && student.section_id === section_id)
										.map(student => <tr key={student.id}>
											<td>{student.RollNumber || ""} {toTitleCase(student.Name.substr(0, 12))}</td>
											{
												subjects.map(subject => <td key={subject + student.id}><input type="number" placeholder="enter marks" /></td>)
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

}))(BulkExam)