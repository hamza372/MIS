import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import qs from 'querystring'
import { getSectionsFromClasses } from '../../../../utils/getSectionsFromClasses';
import { getFilteredPayments } from '../../../../utils/getFilteredPayments'
import { StudentLedgerPage } from './StudentLedgerPage';

interface P {
	classes: RootDBState["classes"]
	student: MISStudent
	faculty_id: RootReducerState["auth"]["faculty_id"]
	students: RootDBState["students"]
	settings: RootDBState["settings"]
}

interface S {

}

interface RouteInfo {
	id: string
}

type propTypes = RouteComponentProps<RouteInfo> & P

class printPreview extends Component <propTypes, S>{
	constructor(props: propTypes) {
		super(props)

		this.state = {

		}
	}

	month = () : string => `${qs.parse(this.props.location.search)["?month"] || ""}`
	year = () : string => `${qs.parse(this.props.location.search)["year"] || ""}`

	render() {

		const { classes, student, settings } = this.props

		const sections =  getSectionsFromClasses(classes)
		const curr_class = sections.find(x => x.id === student.section_id ).namespaced_name
		const filteredPayments = getFilteredPayments(student, this.year(), this.month())

	return	<div className="student-fees-ledger">

				<div className="print button" style={{marginBottom:"10px"}} onClick={() => window.print()}>Print</div>

 			 	<div className="voucher-row">
				<StudentLedgerPage 
					payments = {filteredPayments} 
					settings = {settings}
					student = {student}
					class_name = {curr_class}
				/>

				<div className="row print-voucher">
					<StudentLedgerPage 
						payments = {filteredPayments} 
						settings = {settings}
						student = {student}
						class_name = {curr_class}
					/>
					<StudentLedgerPage 
						payments = {filteredPayments} 
						settings = {settings}
						student = {student}
						class_name = {curr_class}
				/>

				</div>
			</div>
		</div>
	
  }
}
export default connect((state: RootReducerState, { match: { params: { id } } } : { match: { params: { id: string}}}) => ({
	classes: state.db.classes,
	faculty_id: state.auth.faculty_id,
	student: state.db.students[id],
	settings: state.db.settings,
}))(withRouter(printPreview))