import React, { Component } from 'react'
import { connect } from 'react-redux'
import { v4 } from 'node-uuid'
import { Link, Redirect } from 'react-router-dom'
import { RouteComponentProps } from 'react-router'

import Former from 'utils/former'
import checkCompulsoryFields from 'utils/checkCompulsoryFields'
import Banner from 'components/Banner'
import Dropdown from 'components/Dropdown'
import { createEditClass, addStudentToSection, removeStudentFromSection, deleteClass } from 'actions'

import './style.css'

interface P {
	classes: RootDBState["classes"]
	faculty: RootDBState["faculty"]
	students: RootDBState["students"]

	save: (mis_class: AugmentedMISClass) => void
	addStudent: (section_id: string, student: MISStudent) => void
	removeStudent: (student: MISStudent) => void
	removeClass: (mis_class: AugmentedMISClass) => void
}

interface S {
	class: AugmentedMISClass
	redirect: boolean
	banner: {
		active: boolean
		good?: boolean
		text?: string
	}
}

interface RouteInfo {
	id: string
}

type AugmentedMISClass = MISClass & {
	new_subject?: string
}

type propsType = RouteComponentProps<RouteInfo> & P

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
	},
	new_subject: ""
})

const defaultClasses = {
	"Nursery": 0,
	"Class 1": 1,
	"Class 2": 2,
	"Class 3": 3,
	"Class 4": 4,
	"Class 5": 5,
	"Class 6": 6,
	"Class 7": 7,
	"Class 8": 8,
	"Class 9": 9,
	"Class 10": 10,
	"O Level": 11,
	"A Level": 12
}

class SingleClass extends Component<propsType, S> {

	former: Former
	constructor(props: propsType) {
		super(props);

		const id = this.id()
		const currClass = id === undefined ? blankClass() : this.props.classes[id]

		this.state = {
			class: currClass,
			redirect : false,
			banner: {
				active: false,
				good: true,
				text: "Saved!"
			}
		}

		this.former = new Former(this, ["class"])
	}

	id = () => this.props.match.params.id

	uniqueSubjects = (): Set<string> => {
		// instead of having a db of subjects, just going to derive it from the 
		// sections table.
		// so we need to loop through all sections, pull out the subjects and compile them

		const subjects = new Set<string>();

		Object.values(this.props.classes)
			.forEach(cl => {
				Object.keys(cl.subjects)
					.forEach(subj => subjects.add(subj))
			})

		return subjects;
	}

	onSave = () => {

		const compulsoryFields = checkCompulsoryFields(this.state.class, [
			["name"] 
		]);

		if(compulsoryFields)
		{
			const errorText = "Please Fill " + compulsoryFields  + " !!!";

			return this.setState({
				banner:{
					active: true,
					good: false,
					text: errorText
				}
			})
		}

		// updating or saving class
		this.props.save(this.state.class)

		this.setState({
			banner:{
				active: true,
				good: true,
				text: "Saved"
			}
		})

		setTimeout(() => this.setState({redirect: this.id() === undefined, banner: { active : false} }), 1500);
	}

	addSubject = () => {

		const new_subject = this.state.class.new_subject;

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
				new_subject: ""
			}
		})
	}

	removeSubject = (subject: string) => () => {

		const val = window.confirm("Are you sure you want to delete?")
		if(!val)
			return

		const {[subject]: removed, ...rest} = this.state.class.subjects;

		this.setState({
			class: {
				...this.state.class,
				subjects: rest
			}
		})
	}

	removeSection = (id: string) => () => {

		const val = window.confirm("Are you sure you want to delete?")
		if(!val)
			return

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

	addStudent = (id: string) => (student: MISStudent) => {
		this.props.addStudent(id, student);
	}

	removeStudent = (student: MISStudent) => {

		const val = window.confirm("Are you sure you want to delete?")
		if(!val)
			return

		this.props.removeStudent(student)
	}

	isNew = () => this.props.location.pathname.indexOf("new") >= 0

	removeClass = (mis_class: AugmentedMISClass) => {
		const val = window.confirm("Are you sure you want to delete?")
		if(!val)
			return

		Object.values(this.props.students)
			.forEach(student => Object.keys(mis_class.sections)
					.forEach(section => 
						{ 
							if(section === student.section_id) 
							this.addStudent("")(this.props.students[student.id])
						})
					)

		this.props.removeClass(mis_class)

		this.setState({
			banner:{
				active: true,
				good: false,
				text: "DELETED"
			}
		})

		setTimeout(() => this.setState({redirect: true, banner: { active : false} }), 1000);
		
	}

	setClassOrder = () => {

		//@ts-ignore
		const class_year = defaultClasses[this.state.class.name]
		if(class_year) {
			this.setState({
				class: {
					...this.state.class,
					classYear: class_year
				}
			})
		}
	}

	render() {
		if(this.state.redirect) {
			return <Redirect to={`/class`} />
		}
		return <div className="single-class">
		{ this.state.banner.active ? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false }
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
						<option value={"Class 9"} />
						<option value={"Class 10"} />
						<option value={"O Level"} />
						<option value={"A Level"} />
					</datalist>
					<input list="class-name" {...this.former.super_handle_flex(["name"], { cb: this.setClassOrder, styles: (val: string) => { return val === "" ? { borderColor : "#fc6171" } : {} } })} placeholder="Name" />
				</div>
				<div className="row">
					<label>Class Order</label>
					<input type="number" {...this.former.super_handle(["classYear"])} placeholder="Class Year" />
				</div>


				<div className="divider">Subjects</div>
				{
					Object.keys(this.state.class.subjects)
						.sort((a, b) => a.localeCompare(b))
						.map(subject => <div className="subject row" key={subject}>
							<div>{subject}</div>
							<div className="button red" style={{width: "initial"}} onClick={this.removeSubject(subject)}>x</div>
						</div>)
				}

				<div className="subject row">
					<input list="subjects" {...this.former.super_handle(["new_subject"])} placeholder="Type or Select Subject" />
					<datalist id="subjects">
					{
						[...this.uniqueSubjects().keys()]
						.sort((a, b) => a.localeCompare(b))
						.map(subj => <option key={subj} value={subj} />)
					}
					</datalist>
					<div className="button green" style={{width: "initial"}} onClick={this.addSubject}>+</div>
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
										<option value={""}>Select Teacher</option>
										{
											Object.values(this.props.faculty)
												.filter( f => f && f.Active && f.Name)
												.sort((a, b) => a.Name.localeCompare(b.Name))
												.map(faculty => <option value={faculty.id} key={faculty.id}>{faculty.Name}</option>)
										}
									</select>
								</div>

								<div className="students">
									<h4>Students</h4>
									{
										Object.values(this.props.students)
											.filter(student => student && student.Name && student.section_id === id)
											.sort((a, b) => (parseInt(a.RollNumber) || 0) - (parseInt(b.RollNumber) || 0))
											.map(student => {
												return <div className="student row" key={student.id}>
													<Link to={`/student/${student.id}/profile`}>{student.RollNumber} {student.Name}</Link>
													<div className="button red" style={{width: "initial"}} onClick={() => this.removeStudent(student)}>x</div>
												</div>
											})
									}

									<div className="row">
										<Dropdown
											items={Object.values(this.props.students)}
											toLabel={(student: MISStudent) => student.Name} 
											onSelect={this.addStudent(id)} 
											toKey={(student: MISStudent) => student.id} 
											placeholder="Student Name" />
									</div>
								</div>

								{ arr.length === 1 ? false : <div className="button red" onClick={this.removeSection(id)}>Delete Section</div> }
							</div>
						})
				}
				<div className="button green" onClick={this.addSection}>Add Another Section</div>

				<div className="save-delete">
					{ !this.isNew() ? <div className="button red" onClick={() => this.removeClass(this.state.class)}>Delete</div> : false }
					<div className="button save" onClick={this.onSave}>Save</div>
				</div>
			</div>
		</div>
	}
}

export default connect((state: RootReducerState) => ({
	classes: state.db.classes,
	faculty: state.db.faculty,
	students: state.db.students
}), (dispatch: Function) => ({
	save: (mis_class: AugmentedMISClass) => dispatch(createEditClass(mis_class)),
	addStudent: (section_id: string, student: MISStudent) => dispatch(addStudentToSection(section_id, student)),
	removeStudent: (student: MISStudent) => dispatch(removeStudentFromSection(student)),
	removeClass: (mis_class: AugmentedMISClass) => dispatch(deleteClass(mis_class))
}))(SingleClass)