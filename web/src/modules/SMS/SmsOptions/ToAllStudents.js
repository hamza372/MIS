import React, { Component } from 'react'
import { smsIntentLink } from 'utils/intent'
import former from 'utils/former'


export default class ToAllStudents extends Component {
	constructor(props) {
	  super(props)
	
	  this.state = {
		  text: ""
	  }

	  this.former = new former(this, [])
	}
	
  render() {

	const { students, sendBatchMessages } = this.props;

	const messages = Object.values(students).filter(student => student.Phone !== undefined && student.Phone !== "")
		.map(S => ({ number: S.Phone, text : this.state.text }))

	return (
		<div>
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

