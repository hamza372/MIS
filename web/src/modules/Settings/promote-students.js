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

		// key: year, value: section_id
		this.state = {
			promotions: Object.values(props.students)
				.filter(x => x.Name && x.Name != "")
				.reduce((agg, curr) => {

					const s = sections.find(x => x.id === curr.section_id)
					if(s === undefined) {
						return { ...agg, [curr.id]:  ""}
					}

					const current_year = parseInt(s.classYear, 10);
					const s2 = sections.find(x => parseInt(x.classYear, 10) === current_year + 1);

					if(s2 === undefined) {
						return { ...agg, [curr.id]:  ""}
					}

					return {...agg, [curr.id]: s2.id }
				}, {})
		}

		this.Former = new former(this, ["promotions"])
	}

	save = () => {

		const filtered_promotions = Object.entries(this.state.promotions)
			.reduce((agg, [student_id, section_id]) => {
				if(section_id !== "" && section_id !== undefined) {
					return {
						...agg,
						[student_id]: section_id
					}
				}

				return agg;
			}, {});

		this.props.save(filtered_promotions);

		// for all students in this.state.promotions who are not empty string, promote them.
	}

	render() {
		const { history, students, classes } = this.props;

		const sections = getSectionsFromClasses(classes);
		const class_options = sections.map(x => <option value={x.id} key={x.id}>{x.namespaced_name}</option>)

		return <Layout history={history}>
			<div className="promote-student">
				<div className="title">Promote Students</div>

				<div className="list">
					<div className="table row" style={{ fontWeight: "bold" }}>
						<div>Student</div>
						<div>Current Class</div>
						<div>Future Class</div>
					</div>
					{
						Object.values(students)
						.filter(x => x.Name)
						.sort((a, b) => a.Name - b.Name)
						.map(student => {
							const s = sections.find(x => x.id === student.section_id);

							return <div className="table row" key={student.id}>
								<Link to={`/student/${student.id}/profile`}>{student.Name}</Link>
								<div>{s ? s.namespaced_name : "No Class"}</div>
								<select {...this.Former.super_handle([student.id])}>
									<option value="">Select Class</option>
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
	save: promotion_map => dispatch(promoteStudents(promotion_map))
}))(PromotePage)