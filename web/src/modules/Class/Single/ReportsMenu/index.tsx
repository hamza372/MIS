import React, { Component } from 'react'
import moment from 'moment'
import { connect } from 'react-redux'
import Former from 'utils/former'
import { smsIntentLink } from 'utils/intent'
import { RouteComponentProps } from 'react-router'
import { logSms } from 'actions'
import chunkify from 'utils/chunkify'
import getSectionFromId from 'utils/getSectionFromId'
import getStudentExamMarksSheet from 'utils/studentExamMarksSheet'
import ResultCard from 'components/Printable/ResultCard/resultCard'

import { ClassResultSheet } from 'components/Printable/ResultCard/classResultSheet'

import './style.css'

type PropsType = {
	curr_class_id: string,
	curr_section_id: string,
	faculty_id: string,
	classes: RootDBState["classes"],
	students: RootDBState["students"],
	settings: RootDBState["settings"],
	exams: RootDBState["exams"],
	grades: RootDBState["settings"]["exams"]["grades"],
	schoolLogo: string
	sms_templates: RootDBState["sms_templates"]

	logSms: (history: MISSMSHistory) => any

} & RouteComponentProps<RouteInfo>

interface S {
	year: string
	exam_title: string
	exams_list_by: string
	print_type: string
}


interface RouteInfo {
	class_id: string
	section_id: string
}

class ClassReportMenu extends Component<PropsType, S> {

	former: Former
	constructor(props: PropsType) {
		super(props);

		this.state = {
			exam_title: "Final-Term",
			year: moment().format("YYYY"),
			exams_list_by: "Sr No.",
			print_type: "Cards"
		}
		this.former = new Former(this, [])
	}

	logSms = (messages: MISSms[]) => {
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

		const { exam_title, year, print_type, exams_list_by } = this.state
		const { students, exams, classes, settings, sms_templates, grades } = this.props
		
		const section_id = this.getSectionIdFromParams()
		const class_id = this.getClassIdFromParams()
		
		const section = getSectionFromId(section_id, classes)
		const section_name  = this.getSectionName(section)

		// no. of records per chunk
		const chunkSize = 22;

		const relevant_students = Object.values(students)
			.filter((student: MISStudent) => student.Name &&
				student.exams &&
				student.section_id &&
				student.section_id === section_id)
			.sort((a, b) => (parseInt(a.RollNumber) || 0) - (parseInt(b.RollNumber) || 0))

		const section_exams = Object.values(exams)
			.filter(e => e.class_id === class_id &&
				e.section_id !== undefined &&
				e.section_id === section_id)

		const years = new Set<string>()
		const exam_titles = new Set<string>()
		const examSubjectsWithMarks = new Set<string>()
		
		for (const exam of section_exams) {
			if(exam.name === exam_title && moment(exam.date).format("YYYY") === year) {
				examSubjectsWithMarks.add(`${exam.subject} ( ${exam.total_score} )`)
			}
		}
		for(const [, exam] of Object.entries(exams)) {
			if(exam && exam.id && exam.section_id === section_id) {
				exam_titles.add(exam.name)
				years.add(moment(exam.date).format("YYYY"))
			}
		}

		const exam_filter = { exam_title, year}

		// sorted marks sheet
		const marksSheet = getStudentExamMarksSheet(relevant_students, section_exams, grades, exam_filter)

		const messages = relevant_students
			.filter(s => s.Phone !== "")
			.map(student => ({
				number: student.Phone,
				text: sms_templates.result
					.replace(/\$NAME/g, student.Name)
					// .replace(/\$REPORT/g, reportStringForStudent(student, exams, moment(this.state.start).unix() * 100, moment(this.state.report_filters.end).unix() * 1000, this.state.report_filters.examFilterText, this.state.report_filters.subjectFilterText))
			}))

		const url = smsIntentLink({
			messages,
			return_link: window.location.href
		})

		return <div className="class-report-menu">
			<div className="title no-print">Result Cards for { section_name }</div>
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
								Array.from(exam_titles)
									.sort((a, b) => a.localeCompare(b))
									.map(title => {
										return <option key={title} value={title}>{title}</option>
									})
							}
						</select>
					</div>
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
				{settings.sendSMSOption === "SIM" ? <a className="md-button blue sms" onClick={() => this.logSms(messages)} href={url}>Send Reports using SMS</a> : false}
					<div className="md-button grey btn-result-card" onClick={() => window.print()}>Print Class Result {this.state.print_type}</div>
				</div>
			</div>

			<div className="class-report print-page" style={{ height: "100%" }}>
				{
					print_type === "Sheet" && exam_title !== "" ?
						chunkify(marksSheet, chunkSize)
							.map((chunkItems: StudentMarksSheet[], index: number) => <ClassResultSheet key={index}
								sectionName={ section_name }
								examSubjectsWithMarks={examSubjectsWithMarks}
								examName={exam_title}
								schoolName={this.props.settings.schoolName}
								students={chunkItems}
								chunkSize={index === 0 ? 0 : chunkSize * index} />) :

						relevant_students.map(student => (
								<ResultCard key={student.id}
									student={student}
									settings={settings}
									exams={exams}
									grades={grades}
									examFilter={exam_filter}
									logo={this.props.schoolLogo}
									sectionName={section_name}
									listBy={exams_list_by}
								/>))
				}
			</div>

		</div>
	}
}

export default connect((state: RootReducerState) => ({
	faculty_id: state.auth.faculty_id,
	classes: state.db.classes,
	students: state.db.students,
	settings: state.db.settings,
	exams: state.db.exams,
	grades: state.db.settings.exams.grades,
	schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : "",
	sms_templates: state.db.sms_templates
}), (dispatch: Function) => ({
	logSms: (history: MISSMSHistory) => dispatch(logSms(history))
}))(ClassReportMenu)