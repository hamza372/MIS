import React, { Component } from 'react'
import { v4 } from 'node-uuid'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import moment from 'moment'

import checkCompulsoryFields from 'utils/checkCompulsoryFields'

import { mergeExam } from 'actions'
import Banner from 'components/Banner'
import Layout from 'components/Layout'
import Former from 'utils/former'

import './style.css'

const blankExam = () => ({
	id: v4(),
	name: "",
	subject: "",
	total_score: "",
	date: new Date().getTime(),
	student_marks: {
		
	}
})

class SingleExam extends Component {

	constructor(props) {
		super(props);

		const student_marks = Object.entries(this.props.students)
			.filter(([id, student]) => student.section_id === this.section_id() )
			.reduce((agg, [id, student]) => ({ ...agg, [id]: ""}), {})

		this.state = {
			exam: this.exam_id() === undefined ? {
				...blankExam(),
				student_marks
			 } : { 
				 ...this.props.exams[this.exam_id()],
				student_marks: this.getGradesForExistingExam(this.exam_id())
			 },
			 redirect: false,
			 banner: {
				 active: false,
				 good: true,
				 text: "Saved!"
			 }
		}

		this.former = new Former(this, ["exam"])
	}

	getGradesForExistingExam = exam_id => {
		// 
		return Object.entries(this.props.students)
			.filter(([id, student]) => student.section_id === this.section_id())
			.reduce((agg, [id, student]) => {
				if(student.exams === undefined) {
					return agg;
				}
				const exam = student.exams[exam_id]   
				return {
					...agg,
					[id]: exam ? exam.score : ""
				}
			}, {})
	}

	exam_id = () => this.props.match.params.exam_id
	section_id = () => this.props.match.params.section_id
	class_id = () => this.props.match.params.class_id

	onSave = () => {
		console.log("=====================save to exams======================")
		

		const compulsoryFileds = checkCompulsoryFields(this.state.exam, [
			["name"],
			["subject"],
			["total_score"] 
		]);
		
		if(compulsoryFileds){

			const errorText = "Please Fill " + compulsoryFileds  + " !!!"

			return this.setState({
				banner: {
					active: true,
					good: false,
					text: errorText,
				}
			})
		}

		const hasScoreAboveLimit = Object.values(this.state.exam.student_marks)
			.some(mark => parseFloat(mark) > parseFloat(this.state.exam.total_score))

		if(hasScoreAboveLimit)
		{
			return this.setState({
				banner:{
					active: true,
					good: false,
					text: "Marks cannot exceed the max score"
				}
			})
		}

		this.props.saveExam(this.state.exam, this.class_id(), this.section_id());

		this.setState({
			banner: {
				active: true,
				good: true,
				text: "Saved!"
			}
		})

		this.banner_timeout = setTimeout(() => {
			this.setState({
				redirect: this.exam_id() === undefined,
				banner: {
					active: false
				}
			})
		}, 3000)
	}

	// TODO: get students marks again when this rerenders, if the new studentMarks are different from the old ones.

	componentWillUnmount() {
		clearTimeout(this.banner_timeout);
	}

	componentWillReceiveProps(nextProps) {
		
	}

	render() {

		/*
		if(this.state.redirect) {
			console.log("REDIRECTING")
			return <Redirect to={`/reports/${this.class_id()}/${this.section_id()}/exam/${this.state.exam.id}`} />
		}
		*/
		return <Layout>
			<div className="single-exam">
				{ this.state.banner.active? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false }

				<div className="title">Exam</div>
				<div className="form">
					<div className="row">
						<label>Exam Name</label>
						<select {...this.former.super_handle(["name"])}>
							<option value="">Select Exam</option>
							<option value="Test">Test</option>
							<option value="1st Term">1st Term</option>
							<option value="2nd Term">2nd Term</option>
							<option value="Mid-Term">Mid-Term</option>
							<option value="Final-Term">Final-Term</option>
						</select>
					</div>

					<div className="row">
						<label>Subject</label>
						<select {...this.former.super_handle(["subject"])}>
							<option value="" disabled>Please Select a Subject</option>
						{
							Object.keys(this.props.classes[this.class_id()].subjects)
								.map(s => <option value={s} key={s}>{s}</option>)
						}
						</select>
					</div>

					<div className="row">
						<label>Total Score</label>
						<input type="number" {...this.former.super_handle(["total_score"])} placeholder="Maximum Possible Score" />
					</div>

					<div className="row">
						<label>Date of Test</label>
						<input type="date" onChange={this.former.handle(["date"])} value={moment(this.state.exam.date).format("YYYY-MM-DD")} placeholder="Exam Date" />
					</div>

						<div className="divider">Marks</div>
						<div className="section">
						{
							Object.entries(this.props.students)
								.filter(([id, student]) => student.section_id === this.section_id())
								.map(([id, student]) => (
									<div className="student row" key={id}>
										<label><Link to={`/student/${id}/profile`}>{student.Name}</Link></label>
										<input 
											type="number" 
											{...this.former.super_handle(["student_marks", id])} 
											placeholder={`Score out of ${this.state.exam.total_score}`} 
											/>
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
	classes: state.db.classes,
	exams: state.db.exams || {},
	students: state.db.students
}), dispatch => ({
	saveExam: (exam, class_id, section_id) => dispatch(mergeExam(exam, class_id, section_id))
}) )(SingleExam)