import React, { Component } from 'react'
import { smsIntentLink } from 'utils/intent'
import former from 'utils/former'

import moment from 'moment'
import { addSmsHistory } from 'actions'
import {connect} from "react-redux"

class ToAllTeachers extends Component {
	constructor(props) {
	  super(props)
	
	  this.state = {
		  text: ""
	  }

	  this.former = new former(this, [])
	}
	smsHistory = (messages) =>{
		if(messages.length === 0){
			console.log("No Message to Log")
			return
		}
		const historyObj = {
			date: moment.now(),
			type: "ALL_TEACHERS",
			count: messages.length,
			text: this.state.text
		}

		this.props.addSmsHistory(this.props.faculty_id, historyObj)
	}
  render() {

	const { teachers, sendBatchMessages, smsOption } = this.props;
	
	const messages = Object.values(teachers).filter( teacher => teacher.Phone !== undefined && teacher.Phone !== "" )
						.map (T => { 
							return { number: T.Phone, text : this.state.text }
						});

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
								})} onClick={() => this.smsHistory(messages)} className="button blue">Send using Local SIM</a> :

							<div className="button" onClick={() => sendBatchMessages(messages)}>Can only send using Local SIM</div>
					}
			</div>
		)
  }
}

export default connect(state => ({
	faculty_id: state.auth.faculty_id
}), dispatch => ({
	addSmsHistory: (faculty_id, history) => dispatch(addSmsHistory(faculty_id, history)),
}))(ToAllTeachers)