import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import {getSectionsFromClasses} from 'utils/getSectionsFromClasses'
import Layout from 'components/Layout'
import { RouteComponentProps } from 'react-router'
import Former from 'utils/former';
import moment from 'moment';
import { EditIcon, DeleteIcon } from 'assets/icons'

import './style.css'
import getStudentExamMarksSheet from 'utils/studentExamMarksSheet'
import chunkify from 'utils/chunkify'
import { ClassResultSheet } from 'components/Printable/ResultCard/classResultSheet'

type propsType = {
	classes: RootDBState["classes"]
	students: RootDBState["students"]
	exams: RootDBState["exams"]
	grades: RootDBState["settings"]["exams"]["grades"]
	schoolName: string
} & RouteComponentProps

type S = {
	section_id: string
	exam_title: string
	year: string
}
class Reports extends Component<propsType, S> {

	former: Former
	constructor(props: propsType) {
		super(props)

		const year = moment().format("YYYY")
		this.state = {
			section_id: '1ba345d2-1346-4a9e-a2ab-0cb867a13b85',
			exam_title: 'Final-Term',
			year
		}

		this.former = new Former(this, [])
	}

	preserveState = (): void => {
	
	}
	deleteExam = (id: string): void => {
		
	}
	editExam = (exam: MISExam): void => {
		const {class_id, section_id, id} = exam
		const url = `/reports/${class_id}/${section_id}/exam/${id}`

		window.location.href = url
	}
	createNewExam = (): void => {
		
		const { section_id } = this.state

		if(section_id === '') {
			alert("Please select class/section first!")
			return
		}

		const class_id = this.getClassID(section_id)
		const url = `/reports/${class_id}/${section_id}/new`
		
		// preserve state
		this.preserveState()
		// redirect to create new exam page
		window.location.replace(url)
	}
	getClassID = (section_id: string) => {
		const { classes } = this.props

		return  Object.values(classes)
			.find(c => c.sections[section_id] ? true : false).id
	}
	getFilteredExams = (): MISExam[] => {
		const { section_id, year } = this.state
		const { exams } = this.props

		const filtered_exams = Object.entries(exams)
			.filter(([, exam]) =>  exam && exam.id && exam.section_id === section_id && moment(exam.date).format("YYYY") === year)
			.map(([id, exam]) => ({...exam, id}))
		
		return filtered_exams
	}

	renderClassResultSheet = (section: AugmentedSection) => {

		const { section_id, exam_title, year } = this.state
		const { students, exams, grades, schoolName } = this.props
		const filter = { exam_title, year }
		const chunkSize  = 22
		const section_students = Object.values(students)
			.filter(s => s && s.id && s.exams && s.section_id === section_id )
		
		const section_exams = Object.values(exams)
			.filter(exam => exam && exam.section_id && exam.section_id === section_id)

		const examSubjectsWithMarks = new Set<string>()
		
		for (const exam of section_exams) {
			if(exam.name === exam_title && moment(exam.date).format("YYYY") === year) {
				examSubjectsWithMarks.add(`${exam.subject} ( ${exam.total_score} )`)
			}
		}

		const marks_sheet = getStudentExamMarksSheet(section_students, exams, section_exams, grades, filter)
		
		return chunkify(marks_sheet, chunkSize)
			.map((chunkItems: StudentMarksSheet[], index: number) => <ClassResultSheet key={index}
				sectionName={ section ? section.namespaced_name : '' }
				examSubjectsWithMarks={ examSubjectsWithMarks }
				examName={ exam_title }
				schoolName={ schoolName }
				students={ chunkItems }
				chunkSize={ index === 0 ? 0 : chunkSize * index }/>)

	}

	render() {

		const { section_id, exam_title, year } = this.state
		const { classes, exams } = this.props

		const sections = getSectionsFromClasses(classes)
			.sort((a, b) => (a.classYear || 0) - (b.classYear || 0))
		
		const filtered_exams = this.getFilteredExams()
		
		const curr_section = sections.find( section => section.id === section_id)

		const years = new Set<string>()
		const exam_titles = new Set<string>()

		for(const [, exam] of Object.entries(exams)) {
			if(exam && exam.id && exam.section_id === section_id) {
				exam_titles.add(exam.name)
				years.add(moment(exam.date).format("YYYY"))
			}
		}

		return <Layout history={this.props.history}>
			<div className="reports-page no-print">
				<div className="title">Grade Book</div>
				<div className="form section exams-filter">
					<div className="row create-exam">
						<div className="button blue create-exam" onClick={() => this.createNewExam()}>Create New Exam</div>
					</div>
					<div className="table">
						<div className="row">
							<label>Class/Section</label>
							<select {...this.former.super_handle(["section_id"])}>
								<option value="">Select Section</option>
								{
									sections.map( section => <option key={section.id} value={section.id}>{section.namespaced_name}</option>)
								}
							</select>
						</div>
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
							<label>Exam</label>
							<select {...this.former.super_handle(["exam_title"])}>
								<option value="">Select Exam</option>
								{
									Array.from(exam_titles)
										.sort((a, b) => a.localeCompare(b))
										.map(title => <option key={title} value={title}>{title}</option>)
								}
							</select>
						</div>
					</div>
				</div>
				{	
					exam_title !=='' && <div className="section exams-list">
						<fieldset>
							<legend>{exam_title.toUpperCase()}</legend>
							<div className="exams-table">
								<div className="table-row table-header">
									<div className="thead cell">Subject</div>
									<div className="thead cell">Max Score</div>
									<div className="thead cell">Date</div>
									<div className="thead cell" style={{width: "10%"}}>Edit/Delete</div>
								</div>
								{
									filtered_exams
										.filter(exam => exam.name === exam_title)
										.map(exam => <div className="table-row" key={exam.id}>
											<div className="cell">
												<Link to={`/reports/${exam.class_id}/${exam.section_id}/exam/${exam.id}`} onClick={() => this.preserveState()}>{exam.subject}</Link>
											</div>
											<div className="cell">{exam.total_score}</div>
											<div className="cell">{moment(exam.date).format("DD/MM")}</div>
											<div className="cell" style={{width: "10%"}}>
												<div className="">
													<img className="edit-icon" src={EditIcon} onClick={() => this.editExam(exam)} alt="edit"/>
													<img className="delete-icon" src={DeleteIcon} onClick={() => this.deleteExam(exam.id)} alt="delete"/>
												</div>
											</div>
										</div>)
								}
							</div>
						</fieldset>
						<div className="row">
							<div className="button grey" onClick={() => window.print()}>Print Result Sheet</div>
						</div>
					</div>
				}
			</div>
			{
				section_id !== '' && exam_title !== '' && year !=='' && <div className="print-only">{this.renderClassResultSheet(curr_section)}</div>
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
}))(Reports)
