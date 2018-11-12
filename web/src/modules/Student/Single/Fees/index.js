import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import {v4} from 'node-uuid'

import former from 'utils/former'

import { PrintHeader } from 'components/Layout'

import { addPayment } from 'actions'
import checkStudentDues from 'utils/checkStudentDues'

import './style.css'

/*

Write a payment has been received
Forgive a fee
View past payments
Compare to the expected amount

Multiple students will have the same payer (parent)
We need to know when the school year starts and ends (fee period)

*/

class StudentFees extends Component {

	constructor(props) {
		super(props);

		this.state = {
			payment: {
				active: false,
				amount: "",
				type: "SUBMITTED" // submitted or owed
			}
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

		const id = v4();
		const payment = {
			amount: parseFloat(this.state.payment.amount),
			type: this.state.payment.type,
			date: moment.now(),
			fee_id: undefined
		}

		if(this.state.payment.amount !== "") {
			this.props.addPayment(this.student(), id, payment.amount, payment.date, payment.type, payment.fee_id)
		}

		this.setState({
			payment: {
				active: false
			}
		})
	}

	componentDidMount() {
		// loop through fees, check if we have added 
		checkStudentDues(this.student(), this.props.addPayment);
	}

	render() {
		return <div className="student-fees">

			<PrintHeader settings={this.props.settings}/>
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
			<div className="student-name"><b>Student Name:</b> {this.student().Name}</div>
			<div className="payment-history section">
				<div className="table row heading">
					<label><b>Date</b></label>
					<label><b>Label</b></label>
					<label><b>Amount</b></label>
				</div>
			{
				Object.entries(this.student().payments || {})
					.sort(([, a_payment], [, b_payment]) => a_payment.date - b_payment.date)
					.map(([id, payment]) => {
						return <div className="payment" key={id}>
							<div className="table row">
								<div>{moment(payment.date).format("MM/DD")}</div>
								<div>{payment.type === "SUBMITTED" ? "Payed" : payment.type === "FORGIVEN" ? "Need Scholarship" : payment.fee_name || "Fee"}</div>
								<div>{payment.type === "OWED" ? `${payment.amount}` : `-${payment.amount}`}</div>
							</div>
						</div>})
			}
				<div className="table row last">
					<label><b>Amount Owed:</b></label>
					<div><b>{
						Object.values(this.student().payments || {})
							.reduce((agg, curr) => agg - (curr.type === "SUBMITTED" || curr.type === "FORGIVEN" ? 1 : -1) * curr.amount, 0)
						}</b></div>
				</div>
			</div>

			<div className="form">
				<div className="button" onClick={this.newPayment}>{this.state.payment.active ? "Cancel" : "New Entry"}</div>
				<div className="print button" onClick={() => window.print()}>Print</div>

				{ this.state.payment.active ? <div className="new-payment">
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
					<div className="button save" onClick={this.addPayment}>Add Payment</div>
				</div> : false }
			</div>

		</div>
	}
}

export default connect(state => ({
	students: state.db.students,
	settings: state.db.settings
}), dispatch => ({
	addPayment: (student, id, amount, date, type, fee_id, fee_name) => dispatch(addPayment(student, id, amount, date, type, fee_id, fee_name))
}))(StudentFees)