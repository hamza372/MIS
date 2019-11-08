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
	dateSheet : {[subject : string]: { date: number, time: string} }
	selected_student_number: string
	newSubject: string
	notes: string
}

interface RouteInfo {
	class_id : string
	section_id: string
}

type propTypes = P & RouteComponentProps<RouteInfo>


class Planner extends Component <propTypes, S> {

	former: Former
	constructor(props: propTypes) {
		super(props)
		
		const { class_id, section_id } = this.props.match.params
		const curr_class = this.props.classes[class_id]
		
		const date = moment.now()
		const time = moment().format("hh:mm")

		const dateSheet = Object.keys(curr_class.subjects)
		.reduce((agg, curr) => ({
			...agg,
			[curr]: {
				date,
				time
			}
			
		}), {})

		this.state = {
			selected_task: "DATE_SHEET",
			dateSheet,
			selected_student_number: "",
			newSubject: "",
			notes: ""
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
				.map( ([ subject, {date, time} ]) => {
					return `${subject}: ${moment(time, "hh:mm").format("hh:mm A")} / ${moment(date).format("DD-MM-YYYY")}( ${moment(date).format("dddd")} )`
			})
		return header + dateSheet_message.join("\n") + "\n" + this.state.notes
	}

	uniqueSubjects = () => {
		// instead of having a db of subjects, just going to derive it from the 
		// sections table.
		// so we need to loop through all sections, pull out the subjects and compile them

		const s = new Set();

		Object.values(this.props.classes)
			.forEach(cl => {
				Object.keys(cl.subjects)
					.forEach(subj => s.add(subj))
			})

		return s;
	}

	addSubject = () => {

		const subject = this.state.newSubject

		if(this.state.dateSheet[subject] || this.state.newSubject === ""){
			if(this.state.newSubject === "")
				window.alert("Please Enter a Subject Name !!!")
			else
				window.alert("Subject Alreday Exists !!!")
			return
		}

		const date = moment.now()
		const time = moment().format("hh:mm")

		this.setState({
			dateSheet:{
				...this.state.dateSheet,
				[subject]: { date, time }
			}
		})
	}

	removeSubject = ( subject: string) => {

		const val = window.confirm("Are you sure you want to delete?")
		if(!val)
			return
		
		const { [subject]: removed, ...rest }  = this.state.dateSheet

		this.setState({
			dateSheet: rest
		})
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

			{/*
				<div className="divider no-print">Planner</div>
					<div className="row no-print">
					<label> Plan </label>
					<select {...this.former.super_handle(["selected_task"])}>
						<option value="DATE_SHEET">Date Sheet</option>
					</select>
				</div> 
			*/}
				<div className="title">DateSheet</div>

				<div className="row input info"> 
					<div className="row" style={{justifyContent:"flex-start"}}>
						<label style={{marginRight:"2px"}}> <b> Class-Section: </b> </label>
						<div>{`${curr_class.name +"-"+ curr_section.name}`} </div>
					</div>
					
					<div className="row" style={{justifyContent:"flex-end"}}>
						<label> <b> Exam: </b> </label>
						<input style={{marginLeft:"1px"}} type="text"/> 
					</div>
				</div>

				<div className="section table">
					<div className ="row">
						<div className="item"><b> Date </b></div>
						<div className="item"><b> Time </b></div>
						<div className="item"><b> Subject </b></div>
					</div>
						{
							Object.entries(this.state.dateSheet)
								.sort(([,a],[, b]) => a.date !== b.date ? (a.date - b.date) : (a.time.localeCompare(b.time)))
								.map( ([ subject, { date, time }]) => {
									return <div className="row" key={subject}>

										<input className="item" type="date"
											value={moment(date).format("YYYY-MM-DD")}
											onChange={this.former.handle(["dateSheet", subject, "date"])}
										/>


										<input className="item" type="time"
											{...this.former.super_handle(["dateSheet", subject, "time"])}
										/>

										<div className="item"> {subject}</div>

										<div className="button red" onClick={()=> this.removeSubject(subject)}> x </div>

									</div>
							})
						}
				</div>
				<textarea className="notes" {...this.former.super_handle(["notes"])} placeholder="Notes"/>
				<div className="row input no-print" style={{marginBottom:"5px"}}>
					<input list="subjects" type="text" {...this.former.super_handle(["newSubject"])} placeholder="Add Subject"/>
					<datalist id="subjects">
					{
						[...this.uniqueSubjects().keys()]
						.sort((a: any, b: any) => a.localeCompare(b))
						.map((subj: any) => <option value={subj} />)
					}
					</datalist>
					<div className="button green" onClick={() => this.addSubject()}> + </div>
				</div>
				<div className="row">
					{ settings.sendSMSOption === "SIM" ? 
						<a href={smsIntentLink({
							messages,
							return_link: window.location.href 
							})} onClick={() => this.logSms(messages)} className="button blue">Send</a> 
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