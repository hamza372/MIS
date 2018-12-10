import React, { Component } from 'react'
import { smsIntentLink } from 'utils/intent'
import former from 'utils/former'


export default class ToFeeDefaulters extends Component {
	constructor(props) {
	  super(props)
	
	  this.state = {
			text: "",
	  }

	  this.former = new former(this, [])
	}
	
  render() {

	const { students, sendBatchMessages, smsOption } = this.props;
	
	const messages = Object.values(students)
	.filter(student => Object.values(student.payments)
	.reduce((agg, curr) => agg - (curr.type === "SUBMITTED" || curr.type === "FORGIVEN" ? 1 : -1) * curr.amount, 0) > 0 && student.Phone!== undefined && student.Phone !== "" )
	.map(S => ({ number: S.Phone, text : this.state.text }));

	return (
			<div>
				<div className="row">
					<label>Message</label>
					<textarea {...this.former.super_handle(["text"])} placeholder="Write text message here" />
				</div> 
					{
						smsOption === "SIM" ? 
							<a href={smsIntentLink({
								messages,
								return_link: window.location.href 
								})} className="button blue">Send using Local SIM</a> :

							<div className="button" onClick={() => sendBatchMessages(messages)}>Can only send using Local SIM</div>
					}
			</div>
		)
  }
}