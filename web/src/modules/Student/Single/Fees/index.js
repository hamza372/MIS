import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import {v4} from 'node-uuid'

import former from 'utils/former'

import { addPayment } from 'actions'

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
				amount: 0,
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
				amount: 0,
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

		this.props.addPayment(this.student(), id, payment.amount, payment.date, payment.type, payment.fee_id)

		this.setState({
			payment: {
				active: false
			}
		})
	}

	checkStudentDues = student => {
		const curr = moment().format("MM/YYYY")

		for(let [id, fee] of Object.entries(student.fees || {})) {
			if(fee.period === "MONTHLY") {
				// check if this fee exists in "owed" column.

				const existing_monthly = Object.values(student.payments || {}).find(p => p.fee_id === id && moment(p.date).format("MM/YYYY") === curr);
				if(existing_monthly === undefined) { // there is no payment for this month owed yet
					// create it
					const amount = (fee.type === "FEE" ? 1 : -1) * fee.amount;
					this.props.addPayment(student, id, amount, moment().startOf('month').unix() * 1000, "OWED", id);
				}
			}

			if(fee.period === "ONE_TIME") {
				const existing_one_time = Object.values(student.payments || {}).find(p => p.fee_id === id);
				if(existing_one_time === undefined) {
					const amount = (fee.type === "FEE" ? 1: -1) * fee.amount;
					this.props.addPayment(student, id, amount, moment.now(), "OWED", id);
				}
			}

			// not sure how to do annual yet....
			// it's in the future so i feel like it should be just a date + recurring period
		}
	}

	componentDidMount() {
		// loop through fees, check if we have added 
		this.checkStudentDues(this.student());
	}

	render() {
		return <div className="student-fees">

			<div className="divider">Info</div>
			<div className="table row">
				<label>Total Monthly Fees:</label>
				<div>{Object.values(this.student().fees).reduce((agg, curr) => curr.type === "FEE" && curr.period === "MONTHLY" ? agg + parseFloat(curr.amount) : agg, 0)}</div>
			</div>

			<div className="table row">
				<label>Total Annual Fees:</label>
				<div>{Object.values(this.student().fees).reduce((agg, curr) => curr.type === "FEE" && curr.period === "YEARLY" ? agg + parseFloat(curr.amount) : agg, 0)}</div>
			</div>

			<div className="divider">History</div>
			<div className="payment-history section">
				<div className="table row">
					<label><b>Date</b></label>
					<label><b>Reason</b></label>
					<label><b>Amount</b></label>
				</div>
			{
				Object.entries(this.student().payments || {})
					.sort(([a_id, a_payment], [b_id, b_payment]) => a_payment.date - b_payment.date)
					.map(([id, payment]) => {
						return <div className="payment" key={id}>
						<div className="table row">
							<div>{moment(payment.date).format("MM/DD")}</div>
							<div>{payment.type === "SUBMITTED" ? "Payed" : payment.type === "FORGIVEN" ? "Need Scholarship" : this.student().fees[payment.fee_id].name}</div>
							<div>{payment.type === "OWED" ? `${payment.amount}` : `-${payment.amount}`}</div>
						</div>
					</div>})
			}
				<div className="table row">
					<label><b>Total:</b></label>
					<div><b>{
						Object.values(this.student().payments || {})
							.reduce((agg, curr) => agg - (curr.type === "SUBMITTED" || curr.type === "FORGIVEN" ? 1 : -1) * curr.amount, 0)
						}</b></div>
				</div>
			</div>

			<div className="form">
				<div className="button" onClick={this.newPayment}>{this.state.payment.active ? "Cancel" : "New Payment"}</div>

				{ this.state.payment.active ? <div className="new-payment">
					<div className="row">
						<label>Amount</label>
						<input type="number" {...this.Former.super_handle(["payment", "amount"])} placeholder="Enter Fee Amount" />
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
	students: state.db.students
}), dispatch => ({
	addPayment: (student, id, amount, date, type, fee_id) => dispatch(addPayment(student, id, amount, date, type, fee_id))
}))(StudentFees)