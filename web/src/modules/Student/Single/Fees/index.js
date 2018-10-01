import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import {v4} from 'node-uuid'

import former from 'utils/former'

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

		const id = props.match.params.id;
		this.state = {
			profile: props.students[id],
			payment: {
				active: false,
				amount: 0,
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
				active: true,
				amount: 0
			}
		})
	}

	addPayment = () => {
		// dispatch addPayment action 

		this.setState({
			profile: {
				...this.state.profile,
				payments: {
					...this.state.profile.payments,
					[v4()]: {
						amount: this.state.payment.amount,
						date: moment.now()
					}
				}
			},
			payment: {
				active: false
			}
		})
	}

	render() {
		return <div className="student-fees">

			<div className="divider">Info</div>
			<div className="row">
				<label>Total Monthly Fees:</label>
				<div>{Object.values(this.student().fees).reduce((agg, curr) => curr.type === "FEE" && curr.period === "MONTHLY" ? agg + parseFloat(curr.amount) : agg, 0)}</div>
			</div>

			<div className="row">
				<label>Total Annual Fees:</label>
				<div>{Object.values(this.student().fees).reduce((agg, curr) => curr.type === "FEE" && curr.period === "YEARLY" ? agg + parseFloat(curr.amount) : agg, 0)}</div>
			</div>

			<div className="divider">History</div>
			<div className="payment-history section">
				<div className="row">
					<label><b>Date</b></label>
					<label><b>Amount</b></label>
				</div>
			{
				Object.entries(this.state.profile.payments || {})
					.map(([id, payment]) => <div className="payment" key={id}>
						<div className="row">
							<div>{moment(payment.date).format("MM/DD")}</div>
							<div>{payment.amount}</div>
						</div>
					</div>)
			}
			</div>

			<div className="form">
				<div className="button" onClick={this.newPayment}>New Payment</div>

				{ this.state.payment.active ? <div className="new-payment">
					<div className="row">
						<label>Amount</label>
						<input type="number" {...this.Former.super_handle(["payment", "amount"])} placeholder="Enter Fee Amount" />
					</div>
					<div className="button save" onClick={this.addPayment}>Add Payment</div>
				</div> : false }
			</div>
		</div>
	}
}

export default connect(state => ({
	students: state.db.students
}))(StudentFees)