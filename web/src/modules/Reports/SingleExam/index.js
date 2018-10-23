import React, { Component } from 'react'
import { v4 } from 'node-uuid'
import { connect } from 'react-redux'
import moment from 'moment'

import Layout from 'components/Layout'
import Former from 'utils/former'

import './style.css'

const blankExam = () => ({
	id: v4(),
	name: "",
	subject: "",
	total_score: "",
	date: new Date().getTime()
})

class SingleExam extends Component {

	constructor(props) {
		super(props);

		this.state = {
			exam: this.exam_id() === undefined ? blankExam() : this.props.exams[this.exam_id()]
		}

		this.former = new Former(this, ["exam"])
	}

	exam_id = () => this.props.match.params.exam_id
	section_id = () => this.props.match.params.section_id

	onSave = () => {
		console.log("save to exams")

		// TODO: create actions which do the merges
		// also add table for each student.
		// will need to load existing marks from student db.
	}

	render() {
		return <Layout>
			<div className="single-exam">
				<div className="title">Exam</div>
				<div className="form">
					<div className="row">
						<label>Exam Name</label>
						<input type="text" {...this.former.super_handle(["name"])} placeholder="Exam Name" />
					</div>
					<div className="row">
						<label>Subject</label>
						<datalist id="subjects">
						{
							// TODO!
						}
						</datalist>
						<input list="subjects" {...this.former.super_handle(["subject"])} placeholder="Exam Subject" />
					</div>

					<div className="row">
						<label>Total Score</label>
						<input type="number" {...this.former.super_handle(["total_score"])} placeholder="Maximum Possible Score" />
					</div>

					<div className="row">
						<label>Date</label>
						<input type="date" onChange={this.former.handle(["date"])} value={moment(this.state.exam.date).format("YYYY-MM-DD")} placeholder="Exam Date" />
					</div>

						<div className="divider">Marks</div>
						<div className="section">
						{
							Object.entries(this.props.students)
								.filter(([id, student]) => student.section_id == this.section_id() )
								.map(([id, student]) => (
									<div className="student row">
										<label>{student.Name}</label>
										<input type="number" />
									</div>
								))
						}
						</div>

					<div className="button save" onClick={this.onSave}>Save</div>
				</div>
			</div>
		</Layout>
	}
}

export default connect(state => ({
	exams: state.db.exams || {},
	students: state.db.students
}) )(SingleExam)