import React, { Component } from 'react'
import { connect } from 'react-redux'
import { v4 } from 'node-uuid'

import Layout from 'components/Layout'
import Former from 'utils/former'

import { createEditClass } from 'actions'

import './style.css'

const blankClass = {
	name: "",
	sections: {
		[v4()]: {
			name: "Section 1",
			faculty_id: ""
		}
	}, // always at least 1 section
	subjects: {
		// these need to come from a central list of subjects...
		// 
	},
	new_subject: ""
}
// we dont save class under its own db
// we save the sections. this will be handled by the action we dispatch on save.
// this view is derived from sections.

class SingleClass extends Component {

	constructor(props) {
		super(props);

		const name = props.match.params.name;

		// todo: separate out the subjects to class-level
		const currClass = name === 'new' ? blankClass : Object.values(props.sections)
				.filter(section => section.class === name)
				.reduce((agg, curr) => {
					return {
						...agg,
						sections: {
							...agg.sections,
							[curr.id]: curr
						}
					}
				}, {
					name,
					sections: { }
				})

		this.state = {
			class: currClass
		}

		this.former = new Former(this, ["class"])
	}

	uniqueSubjects = () => {
		// instead of having a db of subjects, just going to derive it from the 
		// sections table.
		// so we need to loop through all sections, pull out the subjects and compile them
		const s = new Set();
		Object.values(this.props.sections)
			.forEach(section => {
				Object.keys(section.subjects)
					.forEach(subj => s.add(subj))
			})
		
		/*
		Object.keys(this.state.class.subjects)
			.forEach(subject => s.add(subject))
		*/

		return s;
	}

	onSave = () => {
		this.props.save();
	}

	addSubject = () => {
		/*
		console.log('add subject');
		this.setState({
			class: {
				...this.state.class,
				subjects: {
					...this.state.class.subjects,
					"New Subject": true
				}
			}
		})
		*/
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

	onSubjectChange = e => {
		console.log(e)
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
						name: "New Section"
					}
				}
			}
		})
	}

	render() {
		return <Layout>
			<div className="single-class">
				<div className="title">Edit Class</div>
				<div className="form">
					<div className="row">
						<label>Name</label>
						<input type="text" {...this.former.super_handle(["name"])} placeholder="Name" />
					</div>

					<div className="divider">Sections</div>

					{
						Object.entries(this.state.class.sections)
							.map(([id, section], i, arr) => <div className="class-section" key={id}>
								<div className="row">
									<label>Section Name</label>
									<input type="text" {...this.former.super_handle(["sections", id, "name"])} />
								</div>

								<div className="row">
									<label>Section Lead</label>
									<select {...this.former.super_handle(["sections", id, "faculty_id"])}>
										<option disabled selected value>select teacher</option>
										{
											Object.values(this.props.faculty)
											.map(faculty => <option value={faculty.id} key={faculty.id}>{faculty.Name}</option>)
										}
									</select>

									
								</div>

							</div>)
					}
					<div className="button" onClick={this.addSection}>Add Section</div>

					<div className="divider">Subjects</div>
					{
						Object.keys(this.state.class.subjects)
						.map(subject => <div className="row">
							<label>{subject}</label>
							<div className="button" onClick={this.removeSubject(subject)}>Remove</div>
						</div>)
					}
					<div className="row">
						<input list="subjects" onChange={this.onSubjectChange} {...this.former.super_handle(["new_subject"])}/>
						<datalist id="subjects">
						{
							[...this.uniqueSubjects().keys()]
							.map(subj => <option value={subj} />)
						}
						</datalist>
						<div className="button" onClick={this.addSubject} style={{marginLeft: "auto"}}>Add Subject</div>
					</div>

					<div className="button save" onClick={this.onSave}>Save</div>
				</div>
			</div>
		</Layout>
	}
}

export default connect(state => ({
	sections: state.db.sections,
	faculty: state.db.faculty
}), dispatch => ({
	save: () => console.log('save')
}))(SingleClass)