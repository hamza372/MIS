import React, { Component } from 'react'
import { smsIntentLink } from 'utils/intent'
import former from 'utils/former'


class ToFeeDefaulters extends Component {
	constructor(props) {
	super(props)
	
	this.state = {
			text: "",
	}

	this.former = new former(this, [])
	}

	logSms = (messages) =>{
		if(messages.length === 0){
			console.log("No Message to Log")
			return
		}
		const historyObj = {
			faculty: this.props.faculty_id,
			date: new Date().getTime(),
			type: "FEE_DEFAULTERS",
			count: messages.length,
			text: this.state.text
		}

		this.props.logSms(historyObj)
	}
	
	render() {

	const { students, sendBatchMessages, smsOption } = this.props;
	
	const messages = Object.values(students)
	.filter(student => (student.tags === undefined || !student.tags["PROSPECTIVE"]) && Object.values(student.payments)
		.reduce((agg, curr) => agg - (curr.type === "SUBMITTED" || curr.type === "FORGIVEN" ? 1 : -1) * curr.amount, 0) > 0 && student.Phone!== undefined && student.Phone !== "" )
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

	console.log(messages)
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
								})} onClick={() => this.logSms(messages)} className="button blue">Send using Local SIM</a> :

							<div className="button" onClick={() => sendBatchMessages(messages)}>Can only send using Local SIM</div>
					}
			</div>
		)
  }
}

export default ToFeeDefaulters;