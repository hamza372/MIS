import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import former from 'utils/former'

import getSectionsFromClasses from 'utils/getSectionsFromClasses'
import { promoteStudents } from 'actions'
import Layout from 'components/Layout'

class PromotePage extends Component {

	constructor(props) {
		super(props)

		// map of student id -> future class.
		// future class should be guessed in future

		const sections = getSectionsFromClasses(props.classes);

		// key: year, value: { current: section_id, next: section_id }
		this.state = {
			current_section: "",
			promotions: Object.values(props.students)
				.filter(x => x.Name && x.Name !== "")
				.reduce((agg, curr) => {

					const s = sections.find(x => x.id === curr.section_id)

					if(s === undefined) {
						return { ...agg, [curr.id]:  ""}
					}

					const current_year = parseInt(s.classYear, 10);
					const s2 = sections.find(x => parseInt(x.classYear, 10) === current_year + 1);

					if(s2 === undefined) {
						return { ...agg, [curr.id]:  "FINISHED_SCHOOL"}
					}

					return {...agg, [curr.id]: s2.id }
				}, {})
		}

		this.Former = new former(this, [])
	}

	save = () => {

		const filtered_promotions = Object.entries(this.state.promotions)
			.reduce((agg, [student_id, section_id]) => {
				if(section_id !== "" && section_id !== undefined && this.props.students[student_id].section_id === this.state.current_section) {
					return {
						...agg,
						[student_id]: {
							current: this.props.students[student_id].section_id,
							next: section_id
						}
					}
				}

				return agg;
			}, {});

		this.props.save(filtered_promotions, getSectionsFromClasses(this.props.classes));

		// for all students in this.state.promotions who are not empty string, promote them.
	}

	render() {
		const { history, students, classes } = this.props;

		const sections = getSectionsFromClasses(classes);
		const class_options = sections.map(x => <option value={x.id} key={x.id}>{x.namespaced_name}</option>)

		return <Layout history={history}>
			<div className="promote-student">
				<div className="title">Promote Students</div>

				<select {...this.Former.super_handle(["current_section"])}>
					<option value="">Select Class</option>
					{
						sections.map(x => <option value={x.id} key={x.id}>{x.namespaced_name}</option>)
					}
				</select>

				<div className="list">
					<div className="table row" style={{ fontWeight: "bold" }}>
						<div>Student</div>
						<div>Current Class</div>
						<div>Future Class</div>
					</div>
					{
						Object.values(students)
						.filter(x => x.Name && x.section_id === this.state.current_section)
						.sort((a, b) => a.Name - b.Name)
						.map(student => {
							const s = sections.find(x => x.id === student.section_id);

							return <div className="table row" key={student.id}>
								<Link to={`/student/${student.id}/profile`}>{student.Name}</Link>
								<div>{s ? s.namespaced_name : "No Class"}</div>
								<select {...this.Former.super_handle(["promotions", student.id])}>
									<option value="">Select Class</option>
									<option value="FINISHED_SCHOOL">Finished School</option>
									{ class_options }
								</select>
							</div>
						})

					}
				</div>

				<div className="blue button" onClick={this.save} style={{ alignSelf: "flex-end", marginRight: "5%", marginTop: "15px" }}>Save</div>
			</div>
		</Layout>
	}
}

export default connect(state => ({
	students: state.db.students,
	classes: state.db.classes
}), dispatch => ({
	save: (promotion_map, sections) => dispatch(promoteStudents(promotion_map, sections))
}))(PromotePage)