import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import moment from 'moment'
import former from 'utils/former';
import { addMultiplePayments } from 'actions'
import { checkStudentDuesReturning } from 'utils/checkStudentDues'
import { getFilteredPayments } from 'utils/getFilteredPayments'

import './style.css'
import { LedgerPage } from './LedgerPage';

type payment = {
	student: MISStudent;
	payment_id: string;
} & MISStudentPayment

interface P {
	curr_class: MISClass;
	faculty_id: RootReducerState["auth"]["faculty_id"];
	students: RootDBState["students"];
	settings: RootDBState["settings"];
	addMultiplePayments: (payments: payment[]) => any;
}

interface S {
	month: string;
	year: string;
}

interface RouteInfo {
	id: string;
}

type propTypes = RouteComponentProps<RouteInfo> & P

class ClassFeeMenu extends Component<propTypes, S> {

	Former: former
	constructor(props: propTypes) {
		super(props);

		this.state = {
			month: "",
			year: ""
		}

		this.Former = new former(this, []);
	}

	componentDidMount() {
		//loop through fees to check if we have added

		const class_payments = Object.values(this.props.students)
			.reduce((agg, s) => {

				if (!s.Name || this.props.curr_class.sections[s.section_id] === undefined) {
					return agg;
				}

				const owedPayments = checkStudentDuesReturning(s)

				if (owedPayments.length > 0) {
					return [
						...agg,
						...owedPayments
					]
				}

				return agg
			}, [])

		this.props.addMultiplePayments(class_payments)

	}

	mergedPaymentsForStudent = (student: MISStudent) => {
		if (student.FamilyID) {
			const siblings = Object.values(this.props.students)
				.filter(s => s.Name && s.FamilyID && s.FamilyID === student.FamilyID)

			const merged_payments = siblings.reduce((agg, curr) => ({
				...agg,
				...curr.payments
			}), {} as { [id: string]: MISStudentPayment })

			return merged_payments
		}

		return student.payments
	}

	render() {

		const { students, curr_class, settings } = this.props

		const relevant_students = Object.values(students)
			.filter(s => curr_class.sections[s.section_id] !== undefined)

		let Months: Array<string> = []
		let Years: Array<string> = []

		for (const s of relevant_students) {

			Months = [...new Set(
				Object.entries(s.payments || {})
					.sort(([, a_payment], [, b_payment]) => a_payment.date - b_payment.date)
					.map(([id, payment]) => moment(payment.date).format("MMMM"))
			)]

			Years = [...new Set(
				Object.entries(s.payments)
					.sort(([, a_payment], [, b_payment]) => a_payment.date - b_payment.date)
					.map(([id, payment]) => moment(payment.date).format("YYYY"))
			)]
		}

		const relevant_payments = relevant_students.reduce((agg, s) => {

			const filteredPayments = getFilteredPayments(this.mergedPaymentsForStudent(s), this.state.year, this.state.month)

			const owed = filteredPayments
				.reduce((agg, [, curr]) => agg - (curr.type === "SUBMITTED" || curr.type === "FORGIVEN" ? 1 : -1) * curr.amount, 0)

			const totalOwed = getFilteredPayments(this.mergedPaymentsForStudent(s), "", "")
				.reduce((agg, [, curr]) => agg - (curr.type === "SUBMITTED" || curr.type === "FORGIVEN" ? 1 : -1) * curr.amount, 0)

			return {
				...agg,
				[s.id]: {
					filteredPayments,
					owed,
					totalOwed
				}
			}

		}, {})

		return <div className="student-fees-ledger">

			<div className="divider no-print">Print Fee Receipts</div>

			<div className="row no-print" style={{ marginBottom: "10px" }}>
				<label>Select Month</label>
				<select className="" {...this.Former.super_handle(["month"])}>
					<option value="">Select Month</option>
					{
						Months.map(Month => {
							return <option key={Month} value={Month}>{Month}</option>
						})
					}
				</select>
			</div>

			<div className="row no-print" style={{ marginBottom: "10px" }}>
				<label>Select Year</label>
				<select className="" {...this.Former.super_handle(["year"])}>
					<option value="">Select Year</option>
					{
						Years.map(year => {
							return <option key={year} value={year}> {year} </option>
						})
					}
				</select>
			</div>
			<div className="print button" style={{ marginBottom: "10px" }} onClick={() => window.print()}>Print</div>

			<div className="voucher-row">
				<LedgerPage
					relevant_payments={relevant_payments}
					students={students}
					settings={settings}
					curr_class={curr_class}
				/>

				<div className="row print-voucher">
					<LedgerPage
						relevant_payments={relevant_payments}
						students={students}
						settings={settings}
						curr_class={curr_class}
					/>
					<LedgerPage
						relevant_payments={relevant_payments}
						students={students}
						settings={settings}
						curr_class={curr_class}
					/>

				</div>
			</div>

		</div>
	}
}

export default connect((state: RootReducerState, { match: { params: { id } } }: { match: { params: { id: string } } }) => ({
	curr_class: state.db.classes[id],
	faculty_id: state.auth.faculty_id,
	students: state.db.students,
	settings: state.db.settings,
}), (dispatch: Function) => ({
	addMultiplePayments: (payments: payment[]) => dispatch(addMultiplePayments(payments))
}))(withRouter(ClassFeeMenu))