import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import moment from 'moment'
import { logSms } from 'actions'
import { smsIntentLink } from 'utils/intent'
import Former from 'utils/former'
import { RouteComponentProps } from 'react-router'
import { ExamTitles } from 'constants/exam'
import ResultCard from 'components/Printable/ResultCard/resultCard'
import getReportStringForStudent from 'utils/getReportStringForStudent'
import getSectionFromId from 'utils/getSectionFromId'
import getFacultyNameFromId from 'utils/getFacultyNameFromId'
import months from 'constants/months'

import './style.css'

type PropsType = {
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
} & ExamFilter

interface RouteInfo {
	id: string
}

type MergeStudentsExams = MISStudent & { merge_exams: AugmentedMISExam[] }

class StudentMarksContainer extends Component<PropsType, S> {

	former: Former
	constructor(props: PropsType) {
		super(props);

		this.state = {
			exam_title: "",
			year: moment().format("YYYY"),
			month: "",
			subject: "",
			exams_list_by: "Sr No.",
		}
		this.former = new Former(this, [])
	}

	logSms = (): void => {

		const historyObj = {
			faculty: this.props.faculty_id,
			date: new Date().getTime(),
			type: "EXAM",
			count: 1,
		}

		this.props.logSms(historyObj)
	}

	getStudentIdFromParams = (): string => {
		return this.props.match.params.id
	}

	render() {

		const { exam_title, exams_list_by, year, month, subject } = this.state

		const { students, settings, sms_templates, exams, classes, grades, faculty } = this.props

		const id = this.getStudentIdFromParams()
		let section_id = ""
		const student = students[id]

		let years = new Set<string>()
		let subjects = new Set<string>()
		let filtered_exams: MISExam[] = []

		for (const [exam_id, exam] of Object.entries(exams)) {
			if (exam.name === exam_title && moment(exam.date).format("YYYY") === year &&
				student.exams && student.exams[exam_id] &&
				(exam_title === "Test" && month !== "" ? moment(exam.date).format("MMMM") === month : true)) {
				// check is subject selected
				if (exam_title === "Test" && subject !== "" ? exam.subject === subject : true) {
					filtered_exams.push(exam)
				}
				// still filter the exam's subjects, to fill the drop down
				subjects.add(exam.subject)
			}

			years.add(moment(exam.date).format("YYYY"))
		}

		let merge_exams: AugmentedMISExam[] = []

		for (const exam of filtered_exams) {
			const stats = student.exams[exam.id]
			if (stats != null) {
				merge_exams.push({ ...exam, stats })
				// getting section id from exam in case of student promoted
				section_id = exam.section_id
			}
		}

		const student_exams: MergeStudentsExams = { ...student, merge_exams }

		const section = getSectionFromId(section_id, classes)
		const faculty_id = section ? section.faculty_id : undefined
		const section_teacher = getFacultyNameFromId(faculty_id, faculty)

		const report_string = getReportStringForStudent(student_exams, exam_title, grades)

		const text = sms_templates.result.replace(/\$NAME/g, student.Name).replace(/\$REPORT/g, report_string);

		const url = smsIntentLink({ messages: [{ number: student.Phone, text: text }], return_link: window.location.href })

		return <div className="student-marks-container">
			<div className="no-print">
				<div className="section form">
					<div className="row">
						<label>Exams for Year</label>
						<select {...this.former.super_handle(["year"])}>
							<option value="">Select Year</option>
							{
								Array.from(years)
									.sort((a, b) => parseInt(b) - parseInt(a))
									.map(year => <option key={year} value={year}>{year}</option>)
							}
						</select>
					</div>
					<div className="row">
						<label>Exam Name</label>
						<select {...this.former.super_handle(["exam_title"])}>
							<option value="">Select Exam</option>
							{
								ExamTitles.map(title => <option key={title} value={title}>{title}</option>)
							}
						</select>
					</div>
					{
						exam_title === "Test" && <div className="row">
							<label>Test Subject</label>
							<select {...this.former.super_handle(["subject"])}>
								<option value="">Select Subject</option>
								{
									Array.from(subjects)
										.sort((a, b) => a.localeCompare(b))
										.map(subject => <option key={subject} value={subject}>{subject}</option>)
								}
							</select>
						</div>
					}
					{
						exam_title === "Test" && <div className="row">
							<label>Test Month</label>
							<select {...this.former.super_handle(["subject"])}>
								<option value="">Select Month</option>
								{
									months.map(month => <option key={month} value={month}>{month}</option>)
								}
							</select>
						</div>
					}
					<div className="row">
						<label>Exam List By</label>
						<select {...this.former.super_handle(["exams_list_by"])}>
							<option value="">Select List By</option>
							<option value="Date">Date</option>
							<option value="Sr No.">Serial No</option>
						</select>
					</div>
					<div className="md-form">
						{settings.sendSMSOption === "SIM" ? <a className="button blue sms btn-sm" onClick={() => this.logSms} href={url}>Send Reports using SMS</a> : false}
						<div className="button grey btn-result-card" onClick={() => window.print()}>Print Result Card</div>
						<Link className="button grey btn-edit-exam"
							to={`/reports?section_id=${section_id}&exam_title=${exam_title}&year=${year}&month=${month}`}>Edit Exam</Link>
					</div>
				</div>
			</div>
			<ResultCard key={student.id}
				student={student_exams}
				settings={settings}
				grades={grades}
				examFilter={{ exam_title, year, month }}
				logo={this.props.schoolLogo}
				section={section}
				sectionTeacher={section_teacher}
				listBy={exams_list_by} />
		</div>
	}
}

export default connect((state: RootReducerState) => ({
	faculty_id: state.auth.faculty_id,
	faculty: state.db.faculty,
	students: state.db.students,
	exams: state.db.exams,
	classes: state.db.classes,
	grades: state.db.settings.exams.grades,
	settings: state.db.settings,
	sms_templates: state.db.sms_templates,
	schoolLogo: state.db.assets ? (state.db.assets.schoolLogo || "") : ""
}), (dispatch: Function) => ({
	logSms: (history: MISSMSHistory): void => dispatch(logSms(history)),
}))(StudentMarksContainer)
