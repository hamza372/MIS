import React, { Component } from 'react'
import moment from 'moment'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'

import { logSms } from 'actions'
import ResultCard from 'components/Printable/ResultCard/resultCard'
import { ClassResultSheet } from 'components/Printable/ResultCard/classResultSheet'

import Months from 'constants/months'
import { ExamTitles } from 'constants/exam'

import Former from 'utils/former'
import { smsIntentLink } from 'utils/intent'
import chunkify from 'utils/chunkify'
import getSectionFromId from 'utils/getSectionFromId'
import getStudentExamMarksSheet from 'utils/studentExamMarksSheet'
import getFacultyNameFromId from 'utils/getFacultyNameFromId'
import getReportStringForStudent from 'utils/getReportStringForStudent'

import './style.css'

type PropsType = {
	curr_class_id: string
	curr_section_id: string
	faculty_id: string
	faculty: RootDBState["faculty"]
	classes: RootDBState["classes"]
	students: RootDBState["students"]
	settings: RootDBState["settings"]
	exams: RootDBState["exams"]
	grades: RootDBState["settings"]["exams"]["grades"]
	schoolLogo: string
	sms_templates: RootDBState["sms_templates"]

	logSms: (history: MISSMSHistory) => void

} & RouteComponentProps<RouteInfo>

type S = {
	exams_list_by: string
	print_type: string
} & ExamFilter

interface RouteInfo {
	class_id: string
	section_id: string
}

class ClassReportMenu extends Component<PropsType, S> {

	former: Former
	constructor(props: PropsType) {
		super(props);

		this.state = {
			exam_title: "",
			year: moment().format("YYYY"),
			month: "",
			subject: "",
			exams_list_by: "Sr No.",
			print_type: "Cards"
		}
		this.former = new Former(this, [])
	}

	logSms = (messages: MISSms[]): void => {
		if (messages.length === 0) {
			console.log("No Message to Log")
			return
		}
		const historyObj = {
			faculty: this.props.faculty_id,
			date: new Date().getTime(),
			type: "EXAM",
			count: messages.length
		}

		this.props.logSms(historyObj)
	}

	getSectionIdFromParams = (): string => {
		return this.props.match.params.section_id
	}

	getClassIdFromParams = (): string => {
		return this.props.match.params.class_id
	}

	getSectionName = (section: AugmentedSection): string => {
		return section && section.namespaced_name ? section.namespaced_name : ""
	}

	render() {

		const { exam_title, subject, year, month, print_type, exams_list_by } = this.state
		const { students, exams, classes, settings, sms_templates, grades, faculty } = this.props

		const exam_filter = { exam_title, year, month, subject }

		const section_id = this.getSectionIdFromParams()
		const section = getSectionFromId(section_id, classes)
		const section_name = this.getSectionName(section)
		const section_teacher = getFacultyNameFromId(section.faculty_id, faculty)
		const class_id = this.getClassIdFromParams()

		// no. of records per chunk
		const chunkSize = 22;

		let years = new Set<string>()
		let filtered_exams: MISExam[] = []
		let subjects = new Set<string>()

		for (const exam of Object.values(exams)) {

			years.add(moment(exam.date).format("YYYY"))

			if (exam.name === exam_title && moment(exam.date).format("YYYY") === year &&
				exam.section_id === section_id &&
				(exam_title === "Test" && month ? moment(exam.date).format("MMMM") === month : true) &&
				(exam_title === "Test" && subject ? exam.subject === subject : true)) {
				filtered_exams.push(exam)
			}
			// show all subjects of class in the list
			if (exam.section_id === section_id && exam.class_id === class_id) {
				subjects.add(exam.subject)
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

		// sorted marks sheet
		const marksSheet = getStudentExamMarksSheet(exam_students, grades)

		const messages = exam_students
			.filter(s => s.Phone !== "")
			.map(student => ({
				number: student.Phone,
				text: sms_templates.result
					.replace(/\$NAME/g, student.Name)
					.replace(/\$REPORT/g, getReportStringForStudent(student, exam_title, grades))
			}))

		const url = smsIntentLink({
			messages,
			return_link: window.location.href
		})

		return <div className="class-report-menu">
			<div className="title no-print">Result Cards for {section_name}</div>
			<div className="section-container section no-print">
				<div className="form">
					<div className="row">
						<label>Exams for Year</label>
						<select {...this.former.super_handle(["year"])}>
							<option value="">Select Year</option>
							{
								Array.from(years).map(year => <option key={year} value={year}>{year}</option>)
							}
						</select>
					</div>
					<div className="row">
						<label>Exam Name</label>
						<select {...this.former.super_handle(["exam_title"])}>
							<option value="">Select Exam</option>
							{
								ExamTitles.map(title => {
									return <option key={title} value={title}>{title}</option>
								})
							}
						</select>
					</div>
					{
						exam_title === "Test" &&
						<div className="row">
							<label>Test Month</label>
							<select {...this.former.super_handle(["month"])}>
								<option value="">Select Month</option>
								{
									Months.map(month => <option key={month} value={month}>{month}</option>)
								}
							</select>
						</div>
					}
					{
						exam_title === "Test" &&
						<div className="row">
							<label>Test Subject</label>
							<select {...this.former.super_handle(["subject"])}>
								<option value="">Select Subject</option>
								{
									Array.from(subjects).map(subject => <option key={subject} value={subject}>{subject}</option>)
								}
							</select>
						</div>
					}
					<div className="row">
						<label>Print</label>
						<select {...this.former.super_handle(["print_type"])}>
							<option value="">Select Print</option>
							<option value="Cards">Class Result Cards</option>
							<option value="Sheet">Class Result Sheet</option>
						</select>
					</div>
					<div className="row">
						<label>Exam List By</label>
						<select {...this.former.super_handle(["exams_list_by"])}>
							<option value="">Select List By</option>
							<option value="Date">Date</option>
							<option value="Sr No.">Serial No</option>
						</select>
					</div>
				</div>
				<div className="md-form">
					{settings.sendSMSOption === "SIM" ? <a className="md-button blue sms btn-sm" onClick={() => this.logSms(messages)} href={url}>Send Reports using SMS</a> : false}
					<div className="md-button grey btn-result-card" onClick={() => window.print()}>Print Class Result {this.state.print_type}</div>
					<Link className="md-button grey btn-edit-exam"
						to={`/reports?section_id=${section_id}&exam_title=${exam_title}&year=${year}&month=${month}`}>Edit Exam</Link>
				</div>
			</div>

			<div className="class-report print-page" style={{ height: "100%" }}>
				{
					print_type === "Sheet" && exam_title !== "" ?
						chunkify(marksSheet, chunkSize)
							.map((chunkItems: StudentMarksSheet[], index: number) => <ClassResultSheet key={index}
								sectionName={section_name}
								relevant_exams={filtered_exams}
								examName={exam_title}
								schoolName={this.props.settings.schoolName}
								students={chunkItems}
								chunkSize={index === 0 ? 0 : chunkSize * index} />) :
						exam_students
							.map((student: MergeStudentsExams) => <ResultCard key={student.id}
								student={student}
								settings={settings}
								grades={grades}
								examFilter={exam_filter}
								logo={this.props.schoolLogo}
								section={section}
								sectionTeacher={section_teacher}
								listBy={exams_list_by} />)
				}
			</div>
		</div>
	}
}

export default connect((state: RootReducerState) => ({
	faculty_id: state.auth.faculty_id,
	faculty: state.db.faculty,
	classes: state.db.classes,
	students: state.db.students,
	settings: state.db.settings,
	exams: state.db.exams,
	grades: state.db.settings.exams.grades,
	schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : "",
	sms_templates: state.db.sms_templates
}), (dispatch: Function) => ({
	logSms: (history: MISSMSHistory): void => dispatch(logSms(history))
}))(ClassReportMenu)