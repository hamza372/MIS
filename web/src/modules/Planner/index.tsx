import React, { Component } from 'react'
import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import Layout from '../../components/Layout' 
import { PrintHeader } from '../../components/Layout'
import Former from '../../utils/former'
import moment from 'moment';

import { logSms } from '../../actions'
import { smsIntentLink } from '../../utils/intent';
import { sendBatchSMS } from '../../actions/core';

import './style.css'

interface P {
	students: RootDBState["students"]
	classes: RootDBState["classes"]
	settings: RootDBState['settings']
	schoolLogo: RootDBState['assets']['schoolLogo']
	faculty_id: string
	logSms: (history: any) => any
	sendBatchMessages: (messages: MISSms[]) => any
}

interface S {
	selected_task : string
	dateSheet : {[subject : string]: number }
	selected_student_number: string
}

interface RouteInfo {
	class_id : string
	section_id: string
}

type propTypes = P & RouteComponentProps<RouteInfo>


class Planner extends Component <propTypes, S> {

	former: Former
	constructor(props:  propTypes) {
	  super(props)
		
		const { class_id, section_id } = this.props.match.params
		const curr_class = this.props.classes[class_id]
		const curr_date = moment(moment.now()).format("YYYY-MM-DD")
		const dateSheet = Object.keys(curr_class.subjects)
		.reduce((agg, curr) => ({
			...agg,
			[curr]: curr_date
		}), {})

	  this.state = {
			selected_task: "DATE_SHEET",
			dateSheet,
			selected_student_number: "",
		}
		
		this.former = new Former (this,[])
	}

	section_id = () => this.props.match.params.section_id
	class_id = () => this.props.match.params.class_id

	logSms = (messages : any) =>{
		if(messages.length === 0){
			console.log("No Messaged to Log")
			return
		}
		const historyObj = {
			faculty: this.props.faculty_id,
			date: new Date().getTime(),
			type: "DATE_SHEET",
			count: messages.length,
		}

		this.props.logSms(historyObj)
	}

	sendBatchMessages = (messages: MISSms[]) => {
		if(messages.length === 0 || messages === undefined){
			return;
		}

		/*
		const type = this.getType(this.state.smsFilter)

		const historyObj = {
			faculty: this.props.faculty_id,
			date: new Date().getTime(),
			type: type,
			count: messages.length,
			text: text
		}
		//this.props.logSms(historyObj)
		*/
		this.props.sendBatchMessages(messages);
	}

	dateSheetString = () : string => {
		
		const header = `Date: ${moment().format("DD MMMM YYYY")}\nDate Sheet of ${this.props.classes[this.class_id()].name}\n`
		
		const dateSheet_message = Object.entries(this.state.dateSheet)
				.map( ([ subject, date ]) => {
					return `${subject}: ${moment(date).format("DD-MM-YYYY")}`
			})
		return header + dateSheet_message.join("\n")
	}
	
	render() {
		const {students, classes, settings, schoolLogo, history} = this.props
		const { class_id, section_id } = this.props.match.params
		
		const curr_class = classes[class_id]
		const curr_section  = curr_class.sections[section_id]

		const text = this.dateSheetString()

		const messages = Object.values(students)
			.filter(s => s.section_id === section_id && (s.tags === undefined || !s.tags["PROSPECTIVE"]) && s.Phone)
			.reduce((agg,student)=> {
				return [...agg,{
					number: student.Phone,
					text
				}]
			}, [])

		console.log(messages)

		return <Layout history={history}> 

			<PrintHeader settings={settings} logo={schoolLogo} />

			<div className="planner">
				<div className="divider no-print">Planner</div>

				<div className="row no-print">
					<label> Plan </label>
					<select {...this.former.super_handle(["selected_task"])}>
						<option value="DATE_SHEET">Date Sheet</option>
					</select>
				</div>
				<div className="divider">Date-Sheet</div>

				<div> <b> Class/Section: </b> {`${curr_class.name +"/"+ curr_section.name}`}</div>

				<div className="section table">
					<div className ="row">
						<div className="item"><b> Date </b></div>
						<div className="item"><b> Subject </b></div>
					</div>
						{
							Object.keys(curr_class.subjects)
								.map((subject)=> {
									return <div className="row" key={subject}>
										<input className="item" type="date" 
											value={moment(this.state.dateSheet[subject]).format("YYYY-MM-DD")}
											onChange={this.former.handle(["dateSheet", subject])}
											/>
										<div className="item"> {subject}</div>
									</div>
							})
						}
				</div>
				<div className="row">
					{ settings.sendSMSOption === "SIM" ? 
						<a href={smsIntentLink({
							messages,
							return_link: window.location.href 
							})} onClick={() => this.logSms(messages)} className="button blue">Send using Local SIM</a> 
							: <div className="button" onClick={() => this.sendBatchMessages(messages)}>Send</div> }
						
					<div className="button blue" onClick={() => window.print()}> Print</div>
				</div>
			</div>
	  
		</Layout>
	
  }
}

export default connect((state: RootReducerState) => ({
	students: state.db.students,
	classes: state.db.classes,
	settings: state.db.settings,
	faculty_id: state.auth.faculty_id,
	schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : ""
}), (dispatch: Function) =>({
	logSms: (history: any) => dispatch(logSms(history)),
	sendBatchMessages: (messages: MISSms[]) => dispatch(sendBatchSMS(messages))
}) )(Planner)