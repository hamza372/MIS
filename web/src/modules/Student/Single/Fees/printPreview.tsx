import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import qs from 'querystring'
import { getSectionsFromClasses } from 'utils/getSectionsFromClasses';
import { getFilteredPayments } from 'utils/getFilteredPayments'
import { StudentLedgerPage } from './StudentLedgerPage';
import { SingleStudentPrintableFeeVoucher } from 'components/Printable/Fee/single-voucher';

interface P {
	classes: RootDBState["classes"];
	student: MISStudent;
	faculty_id: RootReducerState["auth"]["faculty_id"];
	students: RootDBState["students"];
	settings: RootDBState["settings"];
}

interface S {

}

interface RouteInfo {
	id: string;
}

type propTypes = RouteComponentProps<RouteInfo> & P

class printPreview extends Component <propTypes, S>{
	constructor(props: propTypes) {
		super(props)

		this.state = {

		}
	}

	month = (): string => `${qs.parse(this.props.location.search)["?month"] || ""}`
	year = (): string => `${qs.parse(this.props.location.search)["year"] || ""}`

	mergedPaymentsForStudent = (student: MISStudent) => {
		// if(student.FamilyID) {
		// 	const siblings = Object.values(this.props.students)
		// 		.filter(s => s.Name && s.FamilyID && s.FamilyID === student.FamilyID)

		// 	const merged_payments = siblings.reduce((agg, curr) => ({
		// 		...agg,
		// 		...Object.entries(curr.payments).reduce((agg, [pid, p]) => { 
		// 			return {
		// 				...agg,
		// 				[pid]: {
		// 					...p,
		// 					fee_name: p.fee_name && `${curr.Name}-${p.fee_name}`
		// 				}
		// 			}
		// 		}, {} as MISStudent['payments'])
		// 	}), {} as { [id: string]: MISStudentPayment})

		// 	return merged_payments
		// }

		return student.payments
	}

	render() {

		const { classes, student, settings } = this.props

		const sections =  getSectionsFromClasses(classes)
		
		const curr_class = student.section_id !== undefined && student.section_id !== "" ?
			sections.find(x => x.id === student.section_id ).namespaced_name :
			"No Class"
		
		const filteredPayments = getFilteredPayments(this.mergedPaymentsForStudent(student), this.year(), this.month())
		
		// generate random voucher number
		const voucherNo = Math.floor(100000 + Math.random() * 900000)
		let vouchers  = [];
		
		for (let i = 0; i <parseInt(settings.vouchersPerPage || "3"); i++) {
			vouchers.push(<StudentLedgerPage key={i} 
				payments = {filteredPayments} 
				settings = {settings}
				student = {student}
				class_name = {curr_class}
				voucherNo = {voucherNo}/>)
		}
	return (
		<table className="printable-vouchers">
		<section className="section-mb">
			<SingleStudentPrintableFeeVoucher
			settings = {this.props.settings}
			voucherNo = {voucherNo}
			className = {curr_class}
			student = {student}
			payments = {filteredPayments}/>
		</section>);
		
	// return	<div className="student-fees-ledger">
	// 			<div className="print button" style={{marginBottom:"10px"}} onClick={() => window.print()}>Print</div>
	// 			<div className="voucher-row">{vouchers}</div>
	// 		</div>
  }
}
export default connect((state: RootReducerState, { match: { params: { id } } }: { match: { params: { id: string}}}) => ({
	classes: state.db.classes,
	faculty_id: state.auth.faculty_id,
	student: state.db.students[id],
	students: state.db.students,
	settings: state.db.settings,
}))(withRouter(printPreview))
