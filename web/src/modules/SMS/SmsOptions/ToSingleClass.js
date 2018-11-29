import React, { Component } from 'react'
import { smsIntentLink } from 'utils/intent'

import {getSectionsFromClasses} from 'utils/getSectionsFromClasses';


import '../../style.css'
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

	const { classes, students, sendMessage } = this.props;
	
	const message = { messages : [ students.filter(student=> student.section_id !== this.state.selected_section_id)
						.map(S => [{ number: S.Phone, text : this.state.text }])
					]
				}

	return (
			<div>
				<div className="row">
					<label>Select Class/Section</label>		
						<select {...this.former.super_handle(["selected_section_id"])}>
									{
										[<option key="abcd" value="" disabled>Select Section</option>,
										...Object.entries(getSectionsFromClasses(classes))
										.map(([id, C]) => <option key={id} value={C.section_id}>{C.namespaced_name}</option>)
										]
									}
						</select>
				</div>
				<div className="row">
					<label>Message</label>
					<textarea {...this.former.super_handle(["text"])} placeholder="Write text message here" />
				</div> {/**Here   ------------------------------------------------------- */}
					{ !this.props.connected ? 
						<div className="button" onClick={sendMessage}>Send</div> : 
						<a href={smsIntentLink({
							message,
							return_link: window.location.href 
							})} className="button blue">Send using Local SIM</a> }
			</div>
		)
  }
}

