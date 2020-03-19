import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import moment from 'moment'
import former from 'utils/former';
import { addMultiplePayments } from 'actions'
import { checkStudentDuesReturning } from 'utils/checkStudentDues'
import { getFilteredPayments } from 'utils/getFilteredPayments'
import { StudentLedgerPage } from 'modules/Student/Single/Fees/StudentLedgerPage'
import months from 'constants/months'
import getSectionFromId from 'utils/getSectionFromId';
import chunkify from 'utils/chunkify';

import './style.css'

type payment = {
	student: MISStudent
	payment_id: string
} & MISStudentPayment

interface P {
	curr_class: MISClass
	faculty_id: RootReducerState["auth"]["faculty_id"]
	students: RootDBState["students"]
	settings: RootDBState["settings"]
	classes: RootDBState["classes"]
	schoolLogo: string
	addMultiplePayments: (payments: payment[]) => any
}

interface S {
	month: string
	year: string
}

interface RouteInfo {
	id: string
}

type propTypes = RouteComponentProps<RouteInfo> & P

class ClassFeeMenu extends Component<propTypes, S> {

	Former: former
	constructor(props: propTypes) {
		super(props)

		const month = moment().format("MMMM")
		const year = moment().format("YYYY")

		this.state = {
			month,
			year
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

	generateVoucherNumber = (): number => Math.floor(100000 + Math.random() * 900000)

	render() {

		const { month, year } = this.state
		const { students, curr_class, settings, schoolLogo, classes } = this.props

		const relevant_students = Object.values(students)
			.filter(s => curr_class.sections[s.section_id] !== undefined)
			.sort((a, b) => parseInt(a.RollNumber || '0') - parseInt(b.RollNumber || '0'))

		let Years: Array<string> = []

		for (const s of relevant_students) {

			Years = [...new Set(
				Object.entries(s.payments)
					.sort(([, a_payment], [, b_payment]) => a_payment.date - b_payment.date)
					.map(([id, payment]) => moment(payment.date).format("YYYY"))
			)]
		}

		let voucherContainer
		const voucherPerPage = settings && settings.vouchersPerPage ? parseInt(settings.vouchersPerPage) : 3

		// the idea is here: if the user set fee voucher per page to 1,
		// show 3 different students' vouchers per page
		// take the relevant students, pass to chunkify (total_students/3)
		// prepare a voucher chunk of 3 different students and return to map
		// it will automatically handle the case, if there are no 3 student in some chunks
		if (voucherPerPage === 1) {

			voucherContainer = chunkify(relevant_students, 3)
				.map((items: MISStudent[], index: number) => {

					let vouchers = []

					for (const student of items) {
						vouchers.push(<StudentLedgerPage key={student.id}
							payments={getFilteredPayments(this.mergedPaymentsForStudent(student), "", "")}
							settings={settings}
							student={student}
							section={getSectionFromId(student.section_id, classes)}
							voucherNo={this.generateVoucherNumber()}
							css_style={""}
							logo={schoolLogo}
							month={month}
							year={year} />)
					}

					return <div key={index} className="voucher-row" style={{ marginBottom: "30mm" }}>{vouchers}</div>
				})
		} else {

			// this works like single student, if user set voucherPerPgae to 2 or 3
			// vouchers of single student will be 2 or 3 per page

			voucherContainer = relevant_students
				.map((student: MISStudent, index: number) => {

					let vouchers = []
					const voucher_no = this.generateVoucherNumber()

					for (let i = 0; i < voucherPerPage; i++) {
						vouchers.push(<StudentLedgerPage key={student.id + i} // adding i to avoid key duplicaiton
							payments={getFilteredPayments(this.mergedPaymentsForStudent(student), "", "")}
							settings={settings}
							student={student}
							section={getSectionFromId(student.section_id, classes)}
							voucherNo={voucher_no}
							css_style={i === 0 ? "" : "print-only"}
							logo={schoolLogo}
							month={month}
							year={year} />)
					}

					return <div key={index} className="voucher-row" style={{ marginBottom: "30mm" }}>{vouchers}</div>
				})
		}

		return <div className="student-fees-ledger">
			<div className="divider no-print">Print Fee Receipts</div>
			<div className="row no-print" style={{ marginBottom: "10px" }}>
				<label>Fee Month</label>
				<select className="" {...this.Former.super_handle(["month"])}>
					<option value="">Select Month</option>
					{
						months.map(month => {
							return <option key={month} value={month}>{month}</option>
						})
					}
				</select>
			</div>
			<div className="row no-print" style={{ marginBottom: "10px" }}>
				<label>Select Year</label>
				<select className="" {...this.Former.super_handle(["year"])}>
					<option value="">Fee Year</option>
					{
						Years.map(year => {
							return <option key={year} value={year}> {year} </option>
						})
					}
				</select>
			</div>
			<div className="print button" style={{ marginBottom: "10px" }} onClick={() => window.print()}>Print</div>
			<div>{voucherContainer}</div>
		</div>
	}
}

export default connect((state: RootReducerState, { match: { params: { id } } }: { match: { params: { id: string } } }) => ({
	curr_class: state.db.classes[id],
	faculty_id: state.auth.faculty_id,
	students: state.db.students,
	classes: state.db.classes,
	settings: state.db.settings,
	schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : ""
}), (dispatch: Function) => ({
	addMultiplePayments: (payments: payment[]) => dispatch(addMultiplePayments(payments))
}))(withRouter(ClassFeeMenu))