import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import qs from 'querystring'
import { getSectionsFromClasses } from 'utils/getSectionsFromClasses';
import { getFilteredPayments } from 'utils/getFilteredPayments'
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

	render() {

		const { classes, student, settings } = this.props

		const sections =  getSectionsFromClasses(classes)
		
		const curr_class = student.section_id !== undefined && student.section_id !== "" ?
			sections.find(x => x.id === student.section_id ).namespaced_name :
			"No Class"
		
		const filteredPayments = getFilteredPayments(student.payments, this.year(), this.month())
		
		// generate random voucher number
		const voucherNo = Math.floor(100000 + Math.random() * 900000)
		let vouchers  = [];
		
		for (let i = 0; i <parseInt(settings.vouchersPerPage || "3"); i++) {
			vouchers.push(<div className="section-mb">
							<SingleStudentPrintableFeeVoucher key={i}
								settings = {this.props.settings}
								voucherNo = {voucherNo}
								className = {curr_class}
								student = {student}
								payments = {filteredPayments}/>
						</div>)
		}

	return <div className="printable-vouchers">
			{
				vouchers
			}
			<div className="row button blue" style={{margin: "10px 0px"}} onClick={() => window.print()}>Print Fee Voucher</div>
		</div>
  }
}
export default connect((state: RootReducerState, { match: { params: { id } } }: { match: { params: { id: string}}}) => ({
	classes: state.db.classes,
	faculty_id: state.auth.faculty_id,
	student: state.db.students[id],
	students: state.db.students,
	settings: state.db.settings,
}))(withRouter(printPreview))
