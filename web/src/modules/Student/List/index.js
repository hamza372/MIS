import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import qs from 'query-string'
import { getSectionsFromClasses } from 'utils/getSectionsFromClasses';
import Former from 'utils/former'
import toTitleCase from 'utils/toTitleCase'
import getStudentLimt from 'utils/getStudentLimit';
import { LayoutWrap } from 'components/Layout';
import { StudentPrintableList } from 'components/Printable/Student/list';
import { StudenPrintableIDCardList } from 'components/Printable/Student/cardlist';
import { chunkify } from 'utils/chunkify'
import Card from 'components/Card'
import moment from 'moment'
import { StudentIcon } from 'assets/icons'

import './style.css'

const StudentItem = (student) => {

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

const toLabel = (student) => {

	const section_name = student.section ? student.section.namespaced_name : "No Class";
	const admissionNumber = student.AdmissionNumber ? `a${student.AdmissionNumber}` : "";
	const phone = student.Phone;
	return student.Name + student.ManName + section_name + admissionNumber + phone;

}

export class StudentList extends Component {


	constructor(props) {
		super(props)

		this.state = {
			showActiveStudent: true,
			showInactiveStudent: false,
			printStudentCard: false,
			tag: "",
			selected_section_id: ""
		}
		this.former = new Former(this, [])
	}

	uniqueTags = (students) => {

		const tags = new Set();

		Object.values(students)
			.filter(s => s.id && s.Name)
			.forEach(s => {
				Object.keys(s.tags || {})
					.forEach(tag => tags.add(tag))
			})

		return tags;
	}

	getListFilterCondition = (item) => {

		//Active is checked and inactive is unchecked
		if (this.state.showActiveStudent && !this.state.showInactiveStudent && this.state.tag === "") {
			return item.Active
			//Show only Active
		}

		//Active is checked and inactive is unchecked
		if (this.state.showActiveStudent && !this.state.showInactiveStudent && this.state.tag !== "") {

			if (item.tags === undefined) {
				return false
			}
			return item.Active && Object.keys(item.tags).includes(this.state.tag)
			//Show showActiveStudent with selected tag
		}

		//Active is checked and inactive is checked
		if (this.state.showActiveStudent && this.state.showInactiveStudent && this.state.tag === "") {
			return true
			//show All
		}

		//Active is checked and inactive is checked
		if (this.state.showActiveStudent && this.state.showInactiveStudent && this.state.tag !== "") {

			if (item.tags === undefined) {
				return false
			}
			return Object.keys(item.tags).includes(this.state.tag)
			//show all with selected tag
		}

		//Active is unchecked and inactive is checked
		if (!this.state.showActiveStudent && this.state.showInactiveStudent && this.state.tag === "") {
			return !item.Active
			//show only InActive
		}

		//Active is unchecked and inactive is checked
		if (!this.state.showActiveStudent && this.state.showInactiveStudent && this.state.tag !== "") {

			if (item.tags === undefined) {
				return false
			}
			return !item.Active && Object.keys(item.tags).includes(this.state.tag)
			//Show InActive with selected tag
		}

	}

	getSectionName = (sections) => {
		const section = sections.find(section => section.id === this.state.selected_section_id)
		const section_name = section ? section.namespaced_name : ""
		return section_name
	}

	render() {
		const { classes, students, settings, forwardTo, max_limit } = this.props

		const schoolSession = {
			startYear: settings && settings.schoolSession ? moment(settings.schoolSession.start_date).format("YYYY") : "",
			endYear: settings && settings.schoolSession ? moment(settings.schoolSession.end_date).format("YYYY") : ""
		}

		const sections = getSectionsFromClasses(classes)
		const section_name = this.getSectionName(sections)
		const chunkSize = 29 // students per page on printsheet

		let items = Object.entries(students)
			.filter(([, s]) => s.id && s.Name &&
				(forwardTo === "prospective-student" || this.getListFilterCondition(s)) &&
				(this.state.selected_section_id !== "" ? s.section_id === this.state.selected_section_id : true)) // hiding the error for now.... need to build reporting mechanism
			.sort(([, a], [, b]) => a.Name.localeCompare(b.Name))
			.map(([id, student]) => {
				const relevant_section = sections.find(section => student.section_id === section.id);
				return {
					...student,
					section: relevant_section,
					id,
					forwardTo
				}
			});

		if (this.state.selected_section_id.length === 0) {
			items = items.sort((a, b) => {
				const aYear = a.section ? a.section.classYear : 0
				const bYear = b.section ? b.section.classYear : 0

				return aYear - bYear
			})
		}

		let create = '/student/new'
		let createText = "Add new Student"

		if (forwardTo === 'marks' || forwardTo === 'certificates') {
			create = '';
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

		return <div className="student-list">
			<div className="title no-print">All Students</div>
			<div className="no-print">
				<Card
					items={items}
					Component={StudentItem}
					create={create}
					createText={createText}
					toLabel={toLabel}>

					{forwardTo !== "prospective-student" && <div className="row filter-container no-print">
						<div className="row checkbox-container">
							<div className="checkbox">
								<input type="checkbox" {...this.former.super_handle(["showActiveStudent"])} style={{ height: "20px" }} />
								Active
							</div>
							<div className="checkbox">
								<input type="checkbox" {...this.former.super_handle(["showInactiveStudent"])} style={{ height: "20px" }} />
								InActive
							</div>
							<div className="checkbox">
								<input type="checkbox" {...this.former.super_handle(["printStudentCard"])} style={{ height: "20px" }} />
								ID Cards
							</div>
						</div>
						<div className="row">
							<select className="list-select" {...this.former.super_handle(["tag"])} style={{ marginLeft: 0 }}>
								<option value="">Select Tag</option>
								{
									[...this.uniqueTags(students).keys()]
										.filter(tag => tag !== "PROSPECTIVE" && (this.state.showActiveStudent &&
											!this.state.showInactiveStudent ? tag !== "FINISHED_SCHOOL" : true))
										.map(tag => <option key={tag} value={tag}> {tag} </option>)
								}
							</select>
							<select className="list-select" {...this.former.super_handle(["selected_section_id"])}>
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
			</div>

			{	// for first table, Sr. no will start from 1,
				// for other tables, Sr. no will start from chunkSize * index
				// here's "index" representing table number
				!this.state.printStudentCard ?
					chunkify(items, chunkSize)
						.map((chunkItems, index) => <StudentPrintableList students={chunkItems} key={index}
							chunkSize={index === 0 ? 0 : chunkSize * index}
							schoolName={settings.schoolName}
							studentClass={section_name} />)
					:
					// print 10 students ID cards per page
					chunkify(items, 8)
						.map((chunkItems, index) => <StudenPrintableIDCardList students={chunkItems} key={index}
							schoolName={settings.schoolName}
							schoolLogo={this.props.schoolLogo}
							studentClass={section_name}
							schoolSession={schoolSession} />)
			}

		</div>
	}
}

export default connect((state, { location, forwardTo = undefined }) => ({
	students: state.db.students,
	classes: state.db.classes,
	settings: state.db.settings,
	schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : "",
	forwardTo: forwardTo || qs.parse(location.search, { ignoreQueryPrefix: true }).forwardTo || "profile",
	max_limit: state.db.max_limit || -1
}))(LayoutWrap(StudentList));