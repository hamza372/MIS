import React, { Component } from 'react'
import { connect } from 'react-redux'
import { v4 } from 'node-uuid'
import { Link, Redirect } from 'react-router-dom'
import moment from 'moment'

import Former from 'utils/former'
import Banner from 'components/Banner'
import Layout from 'components/Layout'

import Dropdown from 'components/Dropdown'

import { createEditClass, addStudentToSection, removeStudentFromSection } from 'actions'

import './style.css'

const blankClass = () => ({
	id: v4(),
	name: "",
	classYear: 0,
	sections: { },
	subjects: {
		// these need to come from a central list of subjects...
	},
	new_subject: ""
})

class SingleClass extends Component {

	constructor(props) {
		super(props);

		const id = props.match.params.id;
		console.log(id)
		const currClass = id === undefined ? blankClass() : this.props.classes[id]

		this.state = {
			class: currClass,
			saveBanner: false,
			redirect: false,
			report_dates: {
				start: moment().subtract(1, "month").unix() * 1000,
				end: moment.now()
			}
		}

		this.former = new Former(this, ["class"])

		this.report_former = new Former(this, ["report_dates"])
	}

	id = () => this.props.match.params.id


	uniqueSubjects = () => {
		// instead of having a db of subjects, just going to derive it from the 
		// sections table.
		// so we need to loop through all sections, pull out the subjects and compile them

		const s = new Set();

		Object.values(this.props.classes)
			.forEach(cl => {
				Object.keys(cl.subjects)
					.forEach(subj => s.add(subj))
			})

		return s;
	}

	onSave = () => {

		// create an id
		// will be overriden if its already in class
		this.props.save(this.state.class);

		this.setState({
			saveBanner: true
		})

		setTimeout(() => this.setState({ saveBanner: false, redirect: this.id() === undefined }), 3000);
	}

	addSubject = () => {

		if(this.state.class.new_subject.trim() === "") {
			return;
		}

		this.setState({
			class: {
				...this.state.class,
				subjects: {
					...this.state.class.subjects,
					[this.state.class.new_subject]: true
				},
				new_subject: ""
			}
		})
	}

	removeSubject = subj => () => {
		const {[subj]: removed, ...rest} = this.state.class.subjects;

		this.setState({
			class: {
				...this.state.class,
				subjects: rest
			}
		})
	}

	removeSection = (id) => () => {

		const {[id]: removed, ...rest} = this.state.class.sections;

		this.setState({
			class: {
				...this.state.class,
				sections: rest 
			}
		})
	}

	addSection = () => {
		this.setState({
			class: {
				...this.state.class,
				sections: {
					...this.state.class.sections,
					[v4()]: {
						name: ""
					}
				}
			}
		}, () => this.props.save(this.state.class))
	}

	addStudent = id => student => {
		this.props.addStudent(id, student);
	}

	removeStudent = student => {
		this.props.removeStudent(student)
	}

	render() {

		if(this.state.redirect) {
			return <Redirect to={`/class/${this.state.class.id}/profile`} />
		}
		return <Layout>
			<div className="single-class">
		{ this.state.saveBanner ? <Banner isGood={true} text="Saved!" /> : false }
			<div className="title">Edit Class</div>
			<div className="form">
				<div className="row">
					<label>Name</label>
					<input type="text" {...this.former.super_handle(["name"])} placeholder="Name" />
				</div>
				<div className="row">
					<label>Class Order</label>
					<input type="number" {...this.former.super_handle(["classYear"])} placeholder="Class Year" />
				</div>

				<div className="divider">Subjects</div>
				{
					Object.keys(this.state.class.subjects)
					.map(subject => <div className="subject row" key={subject}>
						<div>{subject}</div>
						<div className="button orange" onClick={this.removeSubject(subject)}>Remove</div>
					</div>)
				}

				<div className="subject row">
					<input list="subjects" {...this.former.super_handle(["new_subject"])} placeholder="Type or Select Subject" />
					<datalist id="subjects">
					{
						[...this.uniqueSubjects().keys()]
						.map(subj => <option key={subj} value={subj} />)
					}
					</datalist>
					<div className="button green" onClick={this.addSubject}>+</div>
				</div>

				<div className="divider">Sections</div>
				{
					Object.entries(this.state.class.sections)
						.map(([id, section], i, arr) => <div className="section" key={id}>
							<div className="row">
								<label>Section Name</label>
								<input type="text" {...this.former.super_handle(["sections", id, "name"])} placeholder="Type Section Name"/>
							</div>

							<div className="row">
								<label>Section Teacher</label>
								<select {...this.former.super_handle(["sections", id, "faculty_id"])}>
									<option disabled selected value>select teacher</option>
									{
										Object.values(this.props.faculty)
										.map(faculty => <option value={faculty.id} key={faculty.id}>{faculty.Name}</option>)
									}
								</select>
							</div>

							<div className="students">
								<h4>Students</h4>
								{
									Object.values(this.props.students)
									.filter(student => student.section_id === id)
									.map(student => {
										return <div className="student row" key={student.id}>
											<Link to={`/student/${student.id}/profile`}>{student.Name}</Link>
											<div className="button orange" onClick={() => this.removeStudent(student)}>Remove</div>
										</div>
									})
								}
								<Dropdown 
									items={Object.values(this.props.students)}
									toLabel={s => s.Name} 
									onSelect={this.addStudent(id)} 
									toKey={s => s.id} 
									placeholder="Student Name" />
							</div>

							<div className="button orange" onClick={this.removeSection(id)}>Delete Section</div>
						</div>)
				}
				<div className="button green" onClick={this.addSection}>Add Section</div>

				<div className="divider">Print Reports</div>
					<div className="row">
						<label>Start Date</label>
						<input type="date" onChange={this.report_former.handle(["start"])} value={moment(this.state.report_dates.start).format("YYYY-MM-DD")} placeholder="Start Date" />
					</div>
					<div className="row">
						<label>End Date</label>
						<input type="date" onChange={this.report_former.handle(["end"])} value={moment(this.state.report_dates.end).format("YYYY-MM-DD")} placeholder="End Date" />
					</div>
					<Link className="button grey" to={`reports/${moment(this.state.report_dates.start).unix() * 1000}/${moment(this.state.report_dates.end).unix() * 1000}`}>Print Preview</Link>

				<div className="button blue" onClick={this.onSave}>Save</div>
			</div>
		</div>
	</Layout>
	}
}

export default connect(state => ({
	classes: state.db.classes,
	faculty: state.db.faculty,
	students: state.db.students
}), dispatch => ({
	save: (c) => dispatch(createEditClass(c)),
	addStudent: (section_id, student) => dispatch(addStudentToSection(section_id, student)),
	removeStudent: (student) => dispatch(removeStudentFromSection(student))
}))(SingleClass)