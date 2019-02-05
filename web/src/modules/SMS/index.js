import React, { Component } from 'react'
import { connect } from 'react-redux'

import { sendSMS, sendBatchSMS } from 'actions/core'

import former from 'utils/former'
import Layout from 'components/Layout'
import Banner from 'components/Banner'

import ToSingleStudent from './SmsOptions/ToSingleStudent';
import ToSingleClass   from './SmsOptions/ToSingleClass';
import ToAllStudents   from './SmsOptions/ToAllStudents';
import ToSingleTeacher from './SmsOptions/ToSingleTeacher';
import ToAllTeachers   from './SmsOptions/ToAllTeachers';
import ToFeeDefaulters from './SmsOptions/ToFeeDefaulters';

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

		console.log('send message', text, number);
		this.props.sendMessage(text, number, this.state.smsFilter);

	}

	sendBatchMessages = (messages) =>{
		if(messages.length === 0 || messages === undefined){
			return;
		}
		console.log("Sending messages", messages);
		this.props.sendBatchMessages(messages,  this.state.smsFilter);
	}

	sendMessageFilter=(e)=>{
		this.setState({ smsFilter : e.target.value})
	}

	getFilteredFunctionality = (value) =>{
		switch(value){
			case "to_single_student":
				return  <ToSingleStudent 
							students={this.props.students} 
							sendMessage={this.sendMessage} 
							connected={this.props.connected}
							smsOption={this.props.smsSetting}
							/>

			case "to_single_class":
				return <ToSingleClass 
							classes={this.props.classes} 
							students={this.props.students} 
							sendBatchMessages={this.sendBatchMessages} 
							connected={this.props.connected}
							smsOption={this.props.smsSetting}
							/>
			
			case "to_all_students":
				return <ToAllStudents 
							students={this.props.students} 
							sendBatchMessages={this.sendBatchMessages} 
							connected={this.props.connected}
							smsOption={this.props.smsSetting}
							/>

			case "to_single_teacher":
				return <ToSingleTeacher 
							teachers={this.props.teachers} 
							sendMessage={this.sendMessage} 
							connected={this.props.connected}
							smsOption={this.props.smsSetting}
							/>
			
			case "to_all_teachers":
				return <ToAllTeachers  
							teachers={this.props.teachers} 
							sendBatchMessages={this.sendBatchMessages} 
							connected={this.props.connected}
							smsOption={this.props.smsSetting}
							/>
			
			case "to_fee_defaulters":
				return  <ToFeeDefaulters						
							students={this.props.students} 
							sendBatchMessages={this.sendBatchMessages} 
							connected={this.props.connected}
							smsOption={this.props.smsSetting}
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
	students: state.db.students,
	classes: state.db.classes,
	teachers:state.db.faculty,
	connected: state.connected,
	smsSetting: state.db.settings.sendSMSOption
}), dispatch => ({
	sendMessage: (text, number, type) => dispatch(sendSMS(text, number, type)),
	sendBatchMessages: (messages, type) => dispatch(sendBatchSMS(messages, type))
}))(SMS);