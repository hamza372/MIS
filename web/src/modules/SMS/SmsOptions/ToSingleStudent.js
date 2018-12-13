import React, { Component } from 'react'
import { smsIntentLink } from 'utils/intent'
import former from 'utils/former'


export default class ToSingleStudent extends Component {
	constructor(props) {
	  super(props)
	
	  this.state = {
		  selected_student_number: "",
		  text: ""
	  }

	  this.former = new former(this, [])
	}
	
  render() {

	const { students, sendMessage, smsOption } = this.props;
	
	return (
		<div>
			<div className="row">
				<label>Select student</label>		
				<select {...this.former.super_handle(["selected_student_number"])}>
					{
						[<option key="abcd" value="" disabled>Select a Student</option>,
						...Object.entries(students)
						.filter(([id, student]) => student.Phone !== undefined && student.Phone !== "")
						.map(([id, student]) => <option key={id} value={student.Phone}>{student.Name}</option>)
						]
					}
				</select>
			</div>
			<div className="row">
				<label>Message</label>
				<textarea {...this.former.super_handle(["text"])} placeholder="Write text message here" />
			</div>
				{
					smsOption === "SIM" ?
						<a href={smsIntentLink({
							messages: [{ number: this.state.selected_student_number, text: this.state.text }],
							return_link: window.location.href 
							})} className="button blue">Send using Local SIM</a> :

						<div className="button" onClick={() => sendMessage( this.state.text, this.state.selected_student_number)}>Send</div>
				}
		</div>
	)
  }
}
