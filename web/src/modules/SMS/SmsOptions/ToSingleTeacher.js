import React, { Component } from 'react'
import { smsIntentLink } from 'utils/intent'

import '../../style.css'
import former from 'utils/former'


export default class ToSingleTeacher extends Component {
	constructor(props) {
	  super(props)
	
	  this.state = {
		  selected_teacher_number: "",
		  text: ""
	  }

	  this.former = new former(this, [])
	}
	
  render() {

	const { teachers, sendMessage } = this.props;
	
	return (
	<div>
		<div className="row">
			<label>Select Teacher</label>		
			<select {...this.former.super_handle(["selected_teacher_number"])}>
				{
					[<option key="abcd" value="" disabled>Select a Teacher</option>,
					...Object.entries(teachers)
					.filter(([id, teacher]) => teacher.Phone !== undefined && teacher.Phone !== "")
					.map(([id, teacher]) => <option key={id} value={teacher.Phone}>{teacher.Name}</option>)
					]
				}
			</select>
		</div>
		<div className="row">
			<label>Message</label>
			<textarea {...this.former.super_handle(["text"])} placeholder="Write text message here" />
		</div>
			{ !this.props.connected ? 
				<div className="button" onClick={()=> sendMessage( this.state.text, this.state.selected_teacher_number)}>Send</div> : 
				<a href={smsIntentLink({
					messages: [{ number: this.state.selected_teacher_number, text: this.state.text }],
					return_link: window.location.href 
					})} className="button blue">Send using Local SIM</a> }
	</div>
	)
  }
}
