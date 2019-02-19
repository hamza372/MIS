import React, { Component } from 'react'
import { connect } from 'react-redux'

import { sendSMS, sendBatchSMS } from 'actions/core'
import { logSms } from 'actions'

import former from 'utils/former'
import Layout from 'components/Layout'
import Banner from 'components/Banner'

import ToSingleStudent from './SmsOptions/ToSingleStudent';
import ToSingleClass   from './SmsOptions/ToSingleClass';
import ToAllStudents   from './SmsOptions/ToAllStudents';
import ToSingleTeacher from './SmsOptions/ToSingleTeacher';
import ToAllTeachers   from './SmsOptions/ToAllTeachers';
import ToFeeDefaulters from './SmsOptions/ToFeeDefaulters';
import ToProspectiveStudents from './SmsOptions/ToProspectiveStudents'

import './style.css'

class SMS extends Component {

	constructor(props) {
		super(props);

		this.state = {
			banner: {
				active: false,
				good: true,
				text: "Saved!"
			},
			smsFilter: "to_single_student"
		}

		this.former = new former(this, [])
	}

	save = () => {
		console.log("SAVE")

		this.props.saveTemplates(this.state.templates);

		this.setState({
			banner: {
				active: true,
				good: true,
				text: "Saved!"
			}
		})

		setTimeout(() => this.setState({ banner: { active: false } }), 3000);
	}

	sendMessage = (text, number) => {
		if(number === "") {
			return;
		}
		
		const type = this.getType(this.state.smsFilter)	
		const historyObj = {
			faculty: this.props.faculty_id,
			date: new Date().getTime(),
			type: type,
			count: 1,
			text: text
		}
		//this.props.logSms(historyObj)
		this.props.sendMessage(text, number);

	}

	sendBatchMessages = (messages, text) => {
		if(messages.length === 0 || messages === undefined){
			return;
		}
		const type = this.getType(this.state.smsFilter)

		const historyObj = {
			faculty: this.props.faculty_id,
			date: new Date().getTime(),
			type: type,
			count: messages.length(),
			text: text
		}
		//this.props.logSms(historyObj)
		this.props.sendBatchMessages(messages); 
	}

	sendMessageFilter=(e)=>{
		this.setState({ smsFilter : e.target.value})
	}

	getType = (value) =>{
		switch(value){
			case "to_single_student":
				return "STUDENT"

			case "to_single_class":
				return "CLASS"
			
			case "to_all_students":
				return "ALL_STUDENTS"

			case "to_single_teacher":
				return "TEACHER"
			
			case "to_all_teachers":
				return "ALL_TEACHERS"
			
			case "to_fee_defaulters":
				return  "FEE_DEFAULTERS"
			case "to_prospective_students":
				return "PROSPECTIVE"
			default:
				return;
		}
	}

	getFilteredFunctionality = (value) =>{
		switch(value){
			case "to_single_student":
				return  <ToSingleStudent 
							students={this.props.students} 
							sendMessage={this.sendMessage} 
							connected={this.props.connected}
							smsOption={this.props.smsSetting}
							logSms={this.props.logSms}
							faculty_id={this.props.faculty_id}
							/>

			case "to_single_class":
				return <ToSingleClass 
							classes={this.props.classes} 
							students={this.props.students} 
							sendBatchMessages={this.sendBatchMessages} 
							connected={this.props.connected}
							smsOption={this.props.smsSetting}
							logSms={this.props.logSms}
							faculty_id={this.props.faculty_id}
							/>
			
			case "to_all_students":
				return <ToAllStudents 
							students={this.props.students} 
							sendBatchMessages={this.sendBatchMessages} 
							connected={this.props.connected}
							smsOption={this.props.smsSetting}
							logSms={this.props.logSms}
							faculty_id={this.props.faculty_id}
							/>

			case "to_single_teacher":
				return <ToSingleTeacher 
							teachers={this.props.teachers} 
							sendMessage={this.sendMessage} 
							connected={this.props.connected}
							smsOption={this.props.smsSetting}
							logSms={this.props.logSms}
							faculty_id={this.props.faculty_id}
							/>
			
			case "to_all_teachers":
				return <ToAllTeachers  
							teachers={this.props.teachers} 
							sendBatchMessages={this.sendBatchMessages} 
							connected={this.props.connected}
							smsOption={this.props.smsSetting}
							logSms={this.props.logSms}
							faculty_id={this.props.faculty_id}
							/>
			
			case "to_fee_defaulters":
				return  <ToFeeDefaulters						
							students={this.props.students} 
							sendBatchMessages={this.sendBatchMessages} 
							connected={this.props.connected}
							smsOption={this.props.smsSetting}
							logSms={this.props.logSms}
							faculty_id={this.props.faculty_id}
							/>
			case "to_prospective_students":
			return <ToProspectiveStudents 
						students={this.props.students} 
						sendBatchMessages={this.sendBatchMessages} 
						connected={this.props.connected}
						smsOption={this.props.smsSetting}
						logSms={this.props.logSms}
						faculty_id={this.props.faculty_id}
						/>
			
			default:
				return;
		}
	}
	render() {

		return <Layout history={this.props.history}>
			<div className="sms-page">
				{ this.state.banner.active ? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false }

				<div className="title">SMS Management</div>
				<div className="form">

					<div className="divider">Send Message</div>
					<div className="section">
						<div className="row"> 
						<label>Send By</label>		
							<select onChange={this.sendMessageFilter} value={this.state.smsFilter}>
									<option value="" disabled>Select</option>
									<option value="to_single_student">Single Student</option>
									<option value="to_single_class">Single Class</option>
									<option value="to_single_teacher">Single Teacher</option>
									<option value="to_all_students">All Students</option>
									<option value="to_all_teachers">All Teachers</option>
									<option value="to_fee_defaulters">Fee Defaulters</option>
									<option value="to_prospective_students">Prospective Students</option>
							</select>
						</div>

						{this.getFilteredFunctionality(this.state.smsFilter)}
					</div>
				</div>
			</div>
		</Layout>
	}
}

export default connect(state => ({
	faculty_id: state.auth.faculty_id,
	students: state.db.students,
	classes: state.db.classes,
	teachers:state.db.faculty,
	connected: state.connected,
	smsSetting: state.db.settings.sendSMSOption
}), dispatch => ({
	sendMessage: (text, number, type) => dispatch(sendSMS(text, number)),
	sendBatchMessages: (messages, type) => dispatch(sendBatchSMS(messages)),
	logSms: (faculty_id, history) => dispatch(logSms(faculty_id, history))
}))(SMS);