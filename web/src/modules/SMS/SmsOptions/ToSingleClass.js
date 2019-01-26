import React, { Component } from 'react'
import { smsIntentLink } from 'utils/intent'

import {getSectionsFromClasses} from 'utils/getSectionsFromClasses';

import former from 'utils/former'


export default class ToSingleClass extends Component {
	constructor(props) {
	super(props)
	
	this.state = {
		selected_section_id: "",
		selected_student_number: "",
		text: ""
	}

	this.former = new former(this, [])
	}

	render() {

	const { classes, students, sendBatchMessages } = this.props;

	const messages = Object.values(students)
		.filter(s => s.section_id === this.state.selected_section_id && s.Phone !== undefined && s.Phone !== "")
		.reduce((agg,student)=> {
			const index  = agg.findIndex(s => s.number === student.Phone)		
			if(index >= 0 ){
				return agg
			}

			return [...agg,{
				number: student.Phone,
				text : this.state.text
			}]
		}, [])
				
	return (
			<div>
				<div className="row">
					<label>Select Class/Section</label>		
						<select {...this.former.super_handle(["selected_section_id"])}>
									{
										[<option key="abcd" value="" disabled>Select Section</option>,
										...Object.entries(getSectionsFromClasses(classes))
										.map(([id, C]) => <option key={id} value={C.id}>{C.namespaced_name}</option>)
										]
									}
						</select>
				</div>
				<div className="row">
					<label>Message</label>
					<textarea {...this.former.super_handle(["text"])} placeholder="Write text message here" />
				</div>
					{ !this.props.connected ? 
						<div className="button" onClick={() => sendBatchMessages(messages)}>Send</div> : 
						<a href={smsIntentLink({
							messages,
							return_link: window.location.href 
							})} className="button blue">Send using Local SIM</a> }
			</div>
		)
	}
}

