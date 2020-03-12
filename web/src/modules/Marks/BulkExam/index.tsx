import React, { Component } from 'react'
import { RouteComponentProps } from 'react-router'
import { connect } from 'react-redux'
import Former from 'utils/former'
import getSectionsFromClasses from 'utils/getSectionsFromClasses'
import Layout from 'components/Layout'
import { ExamTitles } from 'constants/exam'

type P = {
	grades: RootDBState["settings"]["exams"]["grades"]
	schoolName: string
} & RouteComponentProps & RootDBState


type S = {
	section_id: string
	exam_title: string
}

class BulkExam extends Component<P, S> {
	former: Former
	constructor(props: P) {
		super(props)

		this.state = {
			section_id: "0517889e-25c4-49d9-9c5c-22ab487d5eb9",
			exam_title: "Final-Term"
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


	render() {

		const { students, classes, exams, grades, settings, schoolName, history } = this.props
		const { exam_title } = this.state

		const sections = getSectionsFromClasses(classes)

		const subjects = this.getSubjects(sections)

		return <Layout history={history}>
			<div className="bulk-exams">
				<div className="title">Bulk Exam</div>
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
						<label>Exam</label>
						<select {...this.former.super_handle(["exam_title"])}>
							<option value="">Select Exam</option>
							{
								ExamTitles.map(title => <option key={title} value={title}>{title}</option>)
							}
						</select>
					</div>
				</div>
				{
					exam_title && <div className="section-container section" style={{ marginTop: 10 }}>
						<div className="row" style={{ overflow: "auto" }}>
							<table className="marks-table">
								<thead>
									<tr>
										<th style={{ width: "10%" }}>Sr. No</th>
										<th style={{ width: "40%" }}>Exam Subjects</th>
										<th style={{ width: "20%" }}>Max Marks</th>
										<th style={{ width: "20%" }}>Date</th>
										<th style={{ width: "10%" }}>Action</th>
									</tr>
								</thead>
								<tbody>
									{
										subjects
											.sort((a, b) => a.localeCompare(b))
											.map((subject, index) => <tr key={subject}>
												<td className="text-center">{index + 1}</td>
												<td className="">{subject}</td>
												<td><input type="number" placeholder="Enter marks" /></td>
												<td><input type="date" /></td>
												<td><button className="button red">x</button></td>
											</tr>)
									}
								</tbody>
							</table>
						</div>
						<div className="row exam-button" style={{ marginTop: 10, justifyContent: "space-between" }}>
							<div className="button grey">Print Sheet</div>
							<div className="button blue">Create Exams</div>
						</div>
					</div>
				}
			</div>
		</Layout>
	}
}

export default connect((state: RootReducerState) => ({
	students: state.db.students,
	classes: state.db.classes,
	exams: state.db.exams,
	grades: state.db.settings.exams.grades,
	settings: state.db.settings,
	schoolName: state.db.settings.schoolName
}), (dispatch: Function) => ({

}))(BulkExam)