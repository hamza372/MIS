import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import moment from 'moment'
import {v4} from 'node-uuid'

import former from 'utils/former'

import { PrintHeader } from 'components/Layout'
import Banner from 'components/Banner'
import { addMultiplePayments, addPayment, logSms, editPayment } from 'actions'
import { sendSMS } from 'actions/core'
import { checkStudentDuesReturning } from 'utils/checkStudentDues'
import { smsIntentLink } from 'utils/intent'

import './style.css'

/*

	Write a payment has been received
	Forgive a fee
	View past payments
	Compare to the expected amount

	Multiple students will have the same payer (parent)
	We need to know when the school year starts and ends (fee period)

*/

const numberWithCommas = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

class StudentFees extends Component {

	constructor(props) {
		super(props);
		
		const current_month = moment().format("MM/YYYY")
		const edits = Object.entries(this.student().payments)
			.filter(([id,payment]) => moment(payment.date).format("MM/YYYY") === current_month && payment.type !== "SUBMITTED")
			.reduce((agg,[id,payment]) => {
				return {
					...agg,
					[id]: {
						amount: payment.amount,
						fee_id: payment.fee_id
					}
				}
			}, {})

		this.state = {
			banner: {
				active: false,
				good: true,
				text: "Saved!"
			},
			payment: {
				active: false,
				amount: "",
				type: "SUBMITTED", // submitted or owed
				sendSMS: false
			},
			month: moment().format("MMMM"),
			year: moment().format("YYYY"),
			edits
		}

		this.Former = new former(this, []);
	}

	student = () => {
		const id = this.props.match.params.id;
		return this.props.students[id];
	}

	newPayment = () => {
		this.setState({ 
			payment: {
				active: !this.state.payment.active,
				amount: "",
				type: "SUBMITTED"
			}
		})
	}

	addPayment = () => {
		// dispatch addPayment action 

		if(this.state.payment.amount === "") {
			return
		}

		const id = v4();
		const payment = {
			amount: parseFloat(this.state.payment.amount),
			type: this.state.payment.type,
			date: moment.now(),
			fee_id: undefined
		}

		const balance = [...Object.values(this.student().payments), payment]
					.reduce((agg, curr) => agg - (curr.type === "SUBMITTED" || curr.type === "FORGIVEN" ? 1 : -1) * curr.amount, 0)

		if(this.state.payment.sendSMS) {
			// send SMS with replace text for regex etc.
			console.log("SENDING MESSAGE", this.state.payment.sendSMS)
			const message = this.props.feeSMSTemplate
					.replace(/\$BALANCE/g, balance)
					.replace(/\$AMOUNT/g, payment.amount)
					.replace(/\$NAME/g, this.student().Name)

			
			if(this.props.settings.sendSMSOption !== "SIM") {
				alert("can only send messages from local SIM");
			}

			else {
				const url = smsIntentLink({ messages: [{ text: message, number: this.student().Phone }], return_link: window.location.href })
				
				const historyObj = {
					faculty: this.props.faculty_id,
					date: new Date().getTime(),
					type: "FEE",
					count: 1,
				}

				this.props.logSms(historyObj)
				//this.props.history.push(url);
				window.location.href = url;
			}
		}

		this.props.addPayment(this.student(), id, payment.amount, payment.date, payment.type, payment.fee_id)

		this.setState({
			payment: {
				active: false
			}
		})
	}

	getFilterCondition = (payment) =>
	{
		//when both are empty
		if(this.state.month === "" && this.state.year === "") {
			return true
		}
		//when month is empty	
		if(this.state.month === "" && this.state.year !== ""){
			return  moment(payment.date).format("YYYY") === this.state.year;

		}
		//when year is empty
		if(this.state.month !== "" && this.state.year === ""){
			return moment(payment.date).format("MMMM") === this.state.month

		}
		//when both are not empty
		if(this.state.month !== "" && this.state.year !== "")
		{
			return moment(payment.date).format("MMMM") === this.state.month && moment(payment.date).format("YYYY") === this.state.year;
		}
	}

	componentDidMount() {
		// loop through fees, check if we have added 
		const owedPayments = checkStudentDuesReturning(this.student());
		this.props.addMultiplePayments(owedPayments);
	}

	componentWillReceiveProps(newProps) {
		//This will make we get the lates changes
		const id = this.props.match.params.id;
		const student =  newProps.students[id];

		const current_month = moment().format("MM/YYYY")
		const edits = Object.entries(student.payments)
			.filter(([id,payment]) => moment(payment.date).format("MM/YYYY") === current_month && payment.type !== "SUBMITTED")
			.reduce((agg,[id,payment]) => {
				return {
					...agg,
					[id]: {
						amount: payment.amount,
						fee_id: payment.fee_id
					}
				}
			}, {})

			this.setState({
				edits
			})
	}

	onSave = () => {
		this.setState({
			banner: {
				active: true,
				good: true,
				text: "Saved!"
			}
		})

		setTimeout(() => {
			this.setState({
				banner: {
					active: false
				}
			})
		}, 1000);

		const next_edits = Object.entries(this.state.edits)
			.reduce((agg, [payment_id, { fee_id, amount }]) => {
				return {
					...agg,
					[payment_id]: {
						fee_id,
						amount: parseFloat(amount)
					}
				}
			}, {})

		this.props.editPayment(this.student(), next_edits)

	}

	render() {

		const Months =  [...new Set(
			Object.entries(this.student().payments || {})
				.sort(([, a_payment], [, b_payment]) => a_payment.date - b_payment.date)
				.map(([id, payment]) => moment(payment.date).format("MMMM"))
			)]
			
		const Years = [...new Set(
			Object.entries(this.student().payments)
				.sort(([,a_payment],[,b_payment]) => a_payment.date - b_payment.date)
				.map(([id,payment]) => moment(payment.date).format("YYYY"))
			)]
			
		const filteredPayments = Object.entries(this.student().payments || {})
				.sort(([, a_payment], [, b_payment]) => a_payment.date - b_payment.date)
				.filter(([id,payment]) => this.getFilterCondition(payment))
		

		const owed = filteredPayments.reduce((agg, [,curr]) => agg - (curr.type === "SUBMITTED" || curr.type === "FORGIVEN" ? 1 : -1) * curr.amount, 0)
		//const curr_month = moment().format("MM/YYYY")
		const style = { color: owed <= 0 ? "#5ECDB9" : "#FC6171" }

		return <div className="student-fees">
			{ this.state.banner.active ? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false }
			<PrintHeader settings={this.props.settings} logo={this.props.schoolLogo}/>
			<div className="divider">Payment Information</div>
			<div className="table row">
				<label>Total Monthly Fees:</label>
				<div>{Object.values(this.student().fees).reduce((agg, curr) => curr.type === "FEE" && curr.period === "MONTHLY" ? agg + parseFloat(curr.amount) : agg, 0)}</div>
			</div>

			<div className="table row">
				<label>Total One-Time Fees:</label>
				<div>{
					Object.values(this.student().fees)
						.reduce((agg, curr) => curr.type === "FEE" && curr.period === "SINGLE" ? agg + parseFloat(curr.amount) : agg, 0)
				}</div>
			</div>
			<div className="divider">Ledger</div>

					
			
			<div className="filter row no-print"  style={{marginBottom:"10px"}}>
				<select className="" {...this.Former.super_handle(["month"])} style={{ width: "150px" }}>
				
				<option value="">Select Month</option>
				{
					Months.map(Month => {
						return <option key={Month} value={Month}>{Month}</option>	
					})
				}
				</select>
				
				<select className="" {...this.Former.super_handle(["year"])}>
				
				<option value="">Select Year</option>
				{ 
					Years.map(year => {
						return <option key={year} value={year}> {year} </option>
					})
				}
				</select>
			</div>

			<div className="student-name print-only" style={{ textAlign: "left", fontWeight: "normal" }}><b>Student Name:</b> {this.student().Name}</div>
			
			<div className="payment-history section">
				<div className="table row heading">
					<label><b>Date</b></label>
					<label><b>Label</b></label>
					<label><b>Amount</b></label>
				</div>
					{filteredPayments
						.map(([id, payment]) => {
							return <div className="payment" key={id}>
								<div className="table row">
									<div>{moment(payment.date).format("DD/MM")}</div>
									<div>{payment.type === "SUBMITTED" ? "Payed" : payment.type === "FORGIVEN" ? "Need Scholarship" : payment.fee_name || "Fee"}</div>
									
									{ this.state.edits[id] !== undefined ? 
										<div className="row" style={{color:"rgb(94, 205, 185)"}}>
											<input style={{textAlign:"right", border: "none"}} type="number" {...this.Former.super_handle(["edits", id, "amount"])} />
											<span className="no-print" style={{ width:"min-content" }}>*</span>
										</div>
									: <div> {payment.type === "OWED" ? `${numberWithCommas(payment.amount)}` : `${numberWithCommas(payment.amount)}`}</div>}
								</div>
							</div> })
				}
				<div className="table row last">
					<label style={style}><b>{owed <= 0 ? "Advance:" : "Pending:"}</b></label>
					<div style={style}><b>{Math.abs(owed)}</b></div>
				</div>
			</div>
			<div className="form">
			<div className="button save" onClick={this.onSave}>Save</div>
				<div className={`button ${this.state.payment.active ? "orange" : "green"}`} onClick={this.newPayment} style={{marginTop:"10px"}}>{this.state.payment.active ? "Cancel" : "New Entry"}</div>

				{ this.state.payment.active && <div className="new-payment">
					<div className="row">
						<label>Amount</label>
						<input type="number" {...this.Former.super_handle(["payment", "amount"])} placeholder="Enter Amount" />
					</div>
					<div className="row">
						<label>Type</label>
						<select {...this.Former.super_handle(["payment", "type"])}>
							<option value="SUBMITTED">Payed</option>
							<option value="FORGIVEN">Need Scholarship</option>
						</select>
					</div>
					<div className="table row">
						<label>Send SMS</label>
						<select {...this.Former.super_handle(["payment", "sendSMS"])}>
							<option value={false}>No SMS Notification</option>
							<option value={true}>Send SMS Notification</option>
						</select>
					</div>
					<div className="button save" onClick={this.addPayment}>Add Payment</div>
				</div> }
				<div className="print button" onClick={() => window.print()}>Print</div>
			</div>

		</div>
	}
}

export default connect(state => ({
	faculty_id: state.auth.faculty_id,
	students: state.db.students,
	connected: state.connected,
	settings: state.db.settings,
	feeSMSTemplate: (state.db.sms_templates || {}).fee || "",
	schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : "" 
}), dispatch => ({
	addPayment: (student, id, amount, date, type, fee_id, fee_name) => dispatch(addPayment(student, id, amount, date, type, fee_id, fee_name)),
	addMultiplePayments: (payments) => dispatch(addMultiplePayments(payments)),
	sendSMS: (text, number) => dispatch(sendSMS(text, number)),
	logSms: (history) => dispatch(logSms(history)),
	editPayment: (student, payments) => dispatch(editPayment(student,payments))
}))(withRouter(StudentFees))