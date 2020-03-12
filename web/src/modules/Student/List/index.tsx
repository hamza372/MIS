import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link, RouteProps } from 'react-router-dom'
import queryString from 'query-string'
import Former from 'utils/former'
import Card from 'components/Card'
import moment from 'moment'
import toTitleCase from 'utils/toTitleCase'
import getStudentLimt from 'utils/getStudentLimit'
import { LayoutWrap } from 'components/Layout'
import { StudentPrintableList } from 'components/Printable/Student/list'
import { StudenPrintableIDCardList } from 'components/Printable/Student/cardlist'
import getSectionsFromClasses from 'utils/getSectionsFromClasses'
import { StudentIcon } from 'assets/icons'
import { chunkify } from 'utils/chunkify'

import './style.css'

type P = {
	students: RootDBState["students"]
	classes: RootDBState["classes"]
	settings: RootDBState["settings"]
	schoolLogo?: string
	forwardTo: string
	max_limit?: number
}

type S = {
	showActiveStudent: boolean
	showInactiveStudent: boolean
	printStudentCard: boolean
	tag: string
	section_id: string
	previous_count: number
	next_count: number
}

const CHUNK_SIZE_FOR_LIST = 29
const CHUNK_SIZE_FOR_CARDS = 8

export class StudentList extends Component<P, S> {

	former: Former
	constructor(props: P) {
		super(props)

		this.state = {
			showActiveStudent: true,
			showInactiveStudent: false,
			printStudentCard: false,
			tag: "",
			section_id: "",
			previous_count: 0,
			next_count: 32
		}
		this.former = new Former(this, [])
	}

	uniqueTags = (students: RootDBState["students"]): Set<string> => {

		const tags = new Set<string>()

		Object.values(students)
			.filter(s => s.id && s.Name)
			.forEach(s => {
				Object.keys(s.tags || {})
					.forEach(tag => tags.add(tag))
			})

		return tags
	}

	getListFilterCondition = (item: MISStudent) => {

		const { showActiveStudent, showInactiveStudent, tag } = this.state

		//Active is checked and inactive is unchecked
		if (showActiveStudent && !showInactiveStudent && tag === "") {
			return item.Active
			//Show only Active
		}

		//Active is checked and inactive is unchecked
		if (showActiveStudent && !showInactiveStudent && tag) {

			if (item.tags === undefined) {
				return false
			}

			//Show showActiveStudent with selected tag
			return item.Active && item.tags[tag]
		}

		//Active is checked and inactive is checked
		if (showActiveStudent && showInactiveStudent && tag === "") {
			return true
			//show All
		}

		//Active is checked and inactive is checked
		if (showActiveStudent && showInactiveStudent && tag) {

			if (item.tags === undefined) {
				return false
			}
			//show all with selected tag
			return item.tags[tag]
		}

		//Active is unchecked and inactive is checked
		if (!showActiveStudent && showInactiveStudent && tag === "") {
			//show only InActive
			return !item.Active
		}

		//Active is unchecked and inactive is checked
		if (!showActiveStudent && showInactiveStudent && tag) {

			if (item.tags === undefined) {
				return false
			}

			//Show InActive with selected tag
			return !item.Active && item.tags[tag]
		}

	}

	getSectionName = (sections: AugmentedSection[]): string => {
		const { section_id } = this.state
		const section = sections.find(section => section.id === section_id)
		return section ? section.namespaced_name : ""
	}

	onPreviousButton = (items: MISStudent[]) => {

		let { next_count, previous_count } = this.state

		if (next_count > 32) {

			this.setState({ next_count: previous_count }, () => {
				this.setState({ previous_count: previous_count - 32 })
			})
		}

	}


	onNextButton = (items: MISStudent[]) => {

		const { next_count } = this.state

		if (next_count <= items.length) {
			this.setState({ previous_count: next_count }, () => {
				this.setState({ next_count: next_count + 32 })
			})
		}
	}

	render() {

		const { classes, students, settings, forwardTo, max_limit } = this.props
		const { section_id, showActiveStudent, showInactiveStudent, printStudentCard } = this.state

		const schoolSession = {
			startYear: settings && settings.schoolSession ? moment(settings.schoolSession.start_date).format("YYYY") : "",
			endYear: settings && settings.schoolSession ? moment(settings.schoolSession.end_date).format("YYYY") : ""
		}

		const sections = getSectionsFromClasses(classes)
		const section_name = this.getSectionName(sections)

		let items = Object.entries(students)
			.filter(([, s]) => s && s.Name &&
				(forwardTo === "prospective-student" || this.getListFilterCondition(s)) &&
				(section_id ? s.section_id === section_id : true))
			.sort(([, a], [, b]) => a.Name.localeCompare(b.Name))
			.map(([id, student]) => {
				const relevant_section = sections.find(section => student.section_id === section.id)
				return {
					...student,
					section: relevant_section,
					id,
					forwardTo
				}
			})

		if (section_id.length === 0) {
			items = items.sort((a, b) => {
				const aYear = a.section ? a.section.classYear : 0
				const bYear = b.section ? b.section.classYear : 0

				return aYear - bYear
			})
		}

		let create = '/student/new'
		let createText = "Add New Student"

		if (forwardTo === 'marks' || forwardTo === 'certificates') {
			create = ''
		}

		if (getStudentLimt(students, max_limit)) {
			create = ''
		}

		if (forwardTo === "prospective-student") {
			create = "/student/prospective-student/new"
			createText = "New Prospective Student"
			items = items.filter(s => (s.tags !== undefined) && (s.tags["PROSPECTIVE"]))
		} else {
			items = items.filter(s => (s.tags === undefined || !s.tags["PROSPECTIVE"]))
		}

		if (forwardTo === 'payment') {
			create = '/fees/manage'
			createText = "Manage Fees"
		}

		const { previous_count, next_count } = this.state

		return <div className="student-list">
			<div className="title no-print">All Students</div>
			<div className="no-print">
				{
					//@ts-ignore
					<Card
						items={items.slice(previous_count, next_count)}
						Component={StudentItem}
						create={create}
						createText={createText}
						toLabel={toLabel}>

						{forwardTo !== "prospective-student" && <div className="row filter-container no-print">
							<div className="row checkbox-container">
								<div className="checkbox">
									<input type="checkbox" {...this.former.super_handle(["showActiveStudent"])} />
									Active
							</div>
								<div className="checkbox">
									<input type="checkbox" {...this.former.super_handle(["showInactiveStudent"])} />
									InActive
							</div>
								<div className="checkbox">
									<input type="checkbox" {...this.former.super_handle(["printStudentCard"])} />
									Cards
							</div>
							</div>
							<div className="row">
								<select className="list-select" {...this.former.super_handle(["tag"])} style={{ marginLeft: 0 }}>
									<option value="">Select Tag</option>
									{
										[...this.uniqueTags(students).keys()]
											.filter(tag => tag !== "PROSPECTIVE" && (showActiveStudent &&
												!showInactiveStudent ? tag !== "FINISHED_SCHOOL" : true))
											.map(tag => <option key={tag} value={tag}> {tag} </option>)
									}
								</select>
								<select className="list-select" {...this.former.super_handle(["section_id"])}>
									<option value="">Select Class</option>
									{
										sections
											.sort((a, b) => a.classYear - b.classYear)
											.map(section => <option key={section.id} value={section.id}> {section.namespaced_name} </option>)
									}
								</select>
								<div className="print button" onClick={() => window.print()}>Print</div>
							</div>
						</div>}
					</Card>
				}
			</div>

			<div className="row" style={{ width: "90%", justifyContent: "space-between" }}>
				<div className="button blue" onClick={() => this.onPreviousButton(items)}>←</div>
				<div className="button blue" onClick={() => this.onNextButton(items)}>→</div>
			</div>

			{	// for first table, Sr. no will start from 1,
				// for other tables, Sr. no will start from chunkSize * index
				// here's "index" representing table number
				!printStudentCard ?
					chunkify(items, CHUNK_SIZE_FOR_LIST)
						.map((chunkItems: AugmentedStudent[], index: number) => <StudentPrintableList students={chunkItems} key={index}
							chunkSize={index === 0 ? 0 : CHUNK_SIZE_FOR_LIST * index}
							schoolName={settings.schoolName}
							studentClass={section_name} />)
					:
					// print 8 students ID cards per page
					chunkify(items, CHUNK_SIZE_FOR_CARDS)
						.map((chunkItems: AugmentedStudent[], index: number) => <StudenPrintableIDCardList students={chunkItems} key={index}
							schoolName={settings.schoolName}
							schoolLogo={this.props.schoolLogo}
							studentClass={section_name}
							schoolSession={schoolSession} />)
			}

		</div>
	}
}

export default connect((state: RootReducerState, { location, forwardTo = undefined }: { location: RouteProps["location"]; forwardTo: string | undefined }) => ({
	students: state.db.students,
	classes: state.db.classes,
	settings: state.db.settings,
	schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : "",
	forwardTo: forwardTo || queryString.parse(location.search).forwardTo || "profile",
	max_limit: state.db.max_limit || -1
}))(LayoutWrap(StudentList))


const StudentItem = (student: AugmentedStudent) => {

	const section_name = student.section ? student.section.namespaced_name : "No Class"
	const tags = student.tags !== undefined && Object.keys(student.tags).length > 0 ? Object.keys(student.tags) : []
	let card_button_text = "Edit Student"

	if (student.forwardTo === 'payment') {
		card_button_text = "View Payments"
	}
	if (student.forwardTo === 'certificates') {
		card_button_text = "View Certificate"
	}
	if (student.forwardTo === 'marks') {
		card_button_text = "View Marks"
	}

	const avatar = student.ProfilePicture ? student.ProfilePicture.url || student.ProfilePicture.image_string : StudentIcon

	return <div className="profile-card-wrapper" key={Math.random()}>
		<div className="profile">
			<img
				className="thumbnail"
				src={avatar}
				crossOrigin="anonymous"
				alt="profile" />
			<div className="name name-wrap">
				<Link style={{ textDecoration: "none" }} to={`/student/${student.id}/${student.forwardTo}`} key={student.id}>
					{toTitleCase(student.Name)}
				</Link>
			</div>
			<div className="row info">
				<label>F.Name </label>
				<div className="name-wrap">{toTitleCase(student.ManName)}</div>
			</div>
			<div className="row info">
				<label>Class </label>
				<div>{section_name}</div>
			</div>
			<div className="row info">
				<label>Adm No </label>
				<div>{(student.forwardTo !== "prospective-student" && student.AdmissionNumber) || ""}</div>
			</div>
			<div className="row info">
				<label>Roll No </label>
				<div>{(student.forwardTo !== "prospective-student" && student.RollNumber) || ""}</div>
			</div>
			<div className="row info">
				<label>Phone </label>
				<div>{student.Phone || ""}</div>
			</div>
			<div className={`row tags ${tags.length > 0 ? 'scroll' : ''}`}>
				{
					tags
						.filter(tag => tag !== "FINISHED_SCHOOL")
						.map((tag, i) => <div className="tag" key={i}> {tag}</div>)
				}
			</div>
			<Link className="edit-btn" to={`/student/${student.id}/${student.forwardTo}`} key={student.id}>
				{card_button_text}
			</Link>
		</div>
	</div>
}

const toLabel = (student: AugmentedStudent): string => {
	const section_name = student.section ? student.section.namespaced_name : "No Class"
	const admissionNumber = student.AdmissionNumber ? `a${student.AdmissionNumber}` : ""
	const phone = student.Phone
	return student.Name + student.ManName + section_name + admissionNumber + phone
}