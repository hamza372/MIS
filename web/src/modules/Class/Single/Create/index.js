import React, { Component } from 'react'
import { connect } from 'react-redux'
import { v4 } from 'node-uuid'
import { Link, Redirect } from 'react-router-dom'

import Former from 'utils/former'
import Banner from 'components/Banner'

import Dropdown from 'components/Dropdown'

import { createEditClass, addStudentToSection, removeStudentFromSection } from 'actions'

import './style.css'

const blankClass = () => ({
	id: v4(),
	name: "",
	classYear: 0,
	sections: {
		[v4()]: {
			name: "DEFAULT"
		}
	},
	subjects: {
		// these need to come from a central list of subjects...
	}
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
		}

		this.former = new Former(this, ["class"])
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

	addSubject = (new_subject) => {

		if(new_subject.trim() === "") {
			return;
		}

		this.setState({
			class: {
				...this.state.class,
				subjects: {
					...this.state.class.subjects,
					[new_subject]: true
				},
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
		return <div className="single-class">
		{ this.state.saveBanner ? <Banner isGood={true} text="Saved!" /> : false }
			<div className="title">Edit Class</div>
			<div className="form">
				<div className="row">
					<label>Name</label>
					<datalist id="class-name">
						<option value={"Nursery"} />
						<option value={"Class 1"} />
						<option value={"Class 2"} />
						<option value={"Class 3"} />
						<option value={"Class 4"} />
						<option value={"Class 5"} />
						<option value={"Class 6"} />
						<option value={"Class 7"} />
						<option value={"Class 8"} />
					</datalist>
					<input list="class-name" {...this.former.super_handle(["name"])} placeholder="Name" />
				</div>
				<div className="row">
					<label>Class Order</label>
					<input type="number" {...this.former.super_handle(["classYear"])} placeholder="Class Year" />
				</div>


				<div className="divider">Subjects</div> {/* this needs to be a dropdown component */ }
				{
					Object.keys(this.state.class.subjects)
					.map(subject => <div className="subject row" key={subject}>
						<div>{subject}</div>
						<div className="button orange" onClick={this.removeSubject(subject)}>Remove</div>
					</div>)
				}

				<div className="row">
					<Dropdown
						items={[...this.uniqueSubjects().keys()]}
						toLabel={s => s} 
						onSelect={this.addSubject} 
						toKey={s => s} 
						placeholder="Subject Name" />
				</div>

				{ Object.values(this.state.class.sections).length === 1 ? false : <div className="divider">Sections</div> }
				{
					Object.entries(this.state.class.sections)
						.map(([id, section], i, arr) => {
							return <div className={arr.length === 1 ? "" : "section"} key={id}>
								{ arr.length === 1 ? false : <div className="row">
										<label>Section Name</label>
										<input type="text" {...this.former.super_handle(["sections", id, "name"])} placeholder="Type Section Name"/>
									</div>
								}

								<div className="row">
									<label>{arr.length === 1 ? "Teacher" : "Section Teacher"}</label>
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

									<div className="row">

									<Dropdown
										items={Object.values(this.props.students)}
										toLabel={s => s.Name} 
										onSelect={this.addStudent(id)} 
										toKey={s => s.id} 
										placeholder="Student Name" />
										</div>
								</div>

								{ arr.length === 1 ? false : <div className="button orange" onClick={this.removeSection(id)}>Delete Section</div> }
							</div>
						})
				}
				<div className="button green" onClick={this.addSection}>Add Another Section</div>

				<div className="button save" onClick={this.onSave}>Save</div>
			</div>
		</div>
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