import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import qs from 'querystring'
import { getSectionsFromClasses } from 'utils/getSectionsFromClasses';
import { getFilteredPayments } from 'utils/getFilteredPayments'
import { StudentLedgerPage } from './StudentLedgerPage';
import Layout from "components/Layout";

interface P {
	classes: RootDBState["classes"];
	student: MISStudent;
	faculty_id: RootReducerState["auth"]["faculty_id"];
	students: RootDBState["students"];
	settings: RootDBState["settings"];
}

interface RouteInfo {
	id: string;
	famId: string
}

type propTypes = RouteComponentProps<RouteInfo> & P

class printPreview extends Component <propTypes>{

	month = (): string => qs.parse(this.props.location.search)["?month"].toString() || ""
	year = (): string => qs.parse(this.props.location.search)["year"].toString() || ""

	studentID = (): string =>  this.props.match.params.id
	
	familyID = (): string => this.props.match.params.famId

	mergedPaymentsForStudent = () => {
	
		if(this.familyID() !== undefined) {
			const siblings = this.siblings()
			const merged_payments = siblings.reduce((agg, curr) => ({
				...agg,
				...Object.entries(curr.payments).reduce((agg, [pid, p]) => { 
					return {
						...agg,
						[pid]: {
							...p,
							fee_name: p.fee_name && `${curr.Name}-${p.fee_name}`
						}
					}
				}, {} as MISStudent['payments'])
			}), {} as { [id: string]: MISStudentPayment})

			return merged_payments
		}

		return this.student().payments
	}

	student = (): MISStudent => {
		const id = this.studentID()
		return id === undefined ? this.siblings()[0] : this.props.students[id]
	}

	siblings = (): MISStudent[] => {
		const famId = this.familyID()
		return Object.values(this.props.students)
			.filter(s => s && s.Name && s.FamilyID && s.FamilyID === famId)
	}

	getStudentClass = (sections: AugmentedSection[]): string => { 
		const student = this.student()
		return sections.find((x ) => x.id === student.section_id ).namespaced_name || "No Class"
	}

	getFamily = () => {
		const student = this.student()
		const family = {
			ID: student.FamilyID,
			ManName: student.ManName,
			ManCNIC: student.ManCNIC,
			Phone: student.Phone
		} as AugmentedMISFamily

		return family
	}

	generateVoucherNumber = (): number => Math.floor(100000 + Math.random() * 900000)

	render() {

		const { classes, settings } = this.props
		const famId = this.familyID()
		
		let student_class_name: string
		let family: AugmentedMISFamily

		if(famId === undefined) {
			const sections = getSectionsFromClasses(classes)
			student_class_name = this.getStudentClass(sections)
		} else {
			family = this.getFamily()
		}

		const filteredPayments = getFilteredPayments(this.mergedPaymentsForStudent(), this.year(), this.month())
		
		// generate random voucher number
		const voucherNo = this.generateVoucherNumber()
		let vouchers  = [];
		
		for (let i = 0; i <parseInt(settings.vouchersPerPage || "3"); i++) {
			
			if(famId === undefined) {
				vouchers.push(<StudentLedgerPage key={i}
					payments = {filteredPayments}
					settings = {settings}
					student = {this.student()}
					class_name = {student_class_name}
					voucherNo = {voucherNo}
					css_style = {i === 0 ? "" : "print-only"}/>)
			} else {
				vouchers.push(<StudentLedgerPage key={i}
					payments = {filteredPayments}
					settings = {settings}
					family = {family}
					voucherNo = {voucherNo}
					css_style = {i === 0 ? "" : "print-only"}/>)
			}
		}
	const RenderBody = <div className="student-fees-ledger">
					<div className="print button" style={{marginBottom:"10px"}} onClick={() => window.print()}>Print</div>
					<div className="voucher-row">{vouchers}</div>
				</div>
	
	if(famId === undefined){
		return RenderBody	
	}
	// if family payment ledger
	return <Layout history={this.props.history}>
			<div style={{marginTop: 10}}>{ RenderBody }</div>
	</Layout>
}

}
export default connect((state: RootReducerState) => ({
	classes: state.db.classes,
	faculty_id: state.auth.faculty_id,
	students: state.db.students,
	settings: state.db.settings,
}))(withRouter(printPreview))
