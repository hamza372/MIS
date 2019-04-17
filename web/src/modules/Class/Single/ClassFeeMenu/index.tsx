import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import moment from 'moment'
import former from '../../../../utils/former';
import { PrintHeader } from '../../../../components/Layout'

import './style.css'


interface P {
	curr_class: MISClass
	faculty_id: RootReducerState["auth"]["faculty_id"]
	students: RootDBState["students"]
	settings: RootDBState["settings"]
}

interface S {
	month: string
	year: string
}

interface RouteInfo {
	id: string
}

type propTypes = RouteComponentProps<RouteInfo> & P

const numberWithCommas = ( x : number) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

class ClassFeeMenu extends Component <propTypes, S> {

	Former: former
	constructor(props: propTypes) {
		super(props);
		
		this.state = {
			month: "",
			year: ""
		}

		this.Former = new former(this, []);
	}

	getFilterCondition = (payment: MISStudentPayment) =>
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

	render() {

		const { students, curr_class, settings} = this.props
		
		const relevant_students = Object.values(students)
		.filter(s => curr_class.sections[s.section_id] !== undefined)
		
		let Months : Array<string> = []
		let Years : Array<string> = []

		for(let s of relevant_students){

			Months =  [...new Set(
				Object.entries(s.payments || {})
					.sort(([, a_payment], [, b_payment]) => a_payment.date - b_payment.date)
					.map(([id, payment]) => moment(payment.date).format("MMMM"))
				)]
				
			Years = [...new Set(
				Object.entries(s.payments)
					.sort(([,a_payment],[,b_payment]) => a_payment.date - b_payment.date)
					.map(([id,payment]) => moment(payment.date).format("YYYY"))
				)]
		}
		
		const relevant_payments = relevant_students.reduce((agg, s) => {
			
			const filteredPayments = Object.entries(s.payments || {} as MISStudent["payments"])
				.sort(([, a_payment], [, b_payment]) => a_payment.date - b_payment.date)
				.filter(([id,payment]) => this.getFilterCondition(payment))
			
			const owed = filteredPayments
				.reduce((agg, [,curr]) => agg - (curr.type === "SUBMITTED" || curr.type === "FORGIVEN" ? 1 : -1) * curr.amount, 0)

			
			return {
				...agg,
				[s.id] : {
					filteredPayments,
					owed
				}
			}

		}, {})

 		return <div className="student-fees-ledger">

			<div className="divider no-print">Print Fee Receipts</div>

 			<div className="row no-print"  style={{marginBottom:"10px"}}>
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

			<div className="row no-print" style={{marginBottom:"10px"}}>
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
			<div className="print button" style={{marginBottom:"10px"}} onClick={() => window.print()}>Print</div> 			

			<div className="voucher-row">
				<LedgerPage 
					relevant_payments = {relevant_payments}
					students={students}
					settings={settings}
					curr_class={curr_class}
				/>

				<div className="row print-voucher">
					<LedgerPage 
						relevant_payments = {relevant_payments}
						students={students}
						settings={settings}
						curr_class={curr_class}
					/>
					<LedgerPage 
						relevant_payments = {relevant_payments}
						students={students}
						settings={settings}
						curr_class={curr_class}
					/>

				</div>
			</div>

		</div>
	}
}

export default connect((state: RootReducerState, { match: { params: { id } } } : { match: { params: { id: string}}}) => ({
	curr_class: state.db.classes[id],
	faculty_id: state.auth.faculty_id,
	students: state.db.students,
	settings: state.db.settings,
}))(withRouter(ClassFeeMenu))


interface LedgerPageProp {
	relevant_payments: { [id: string]: { filteredPayments : [string, MISStudentPayment][], owed: number }}
	settings: RootDBState["settings"]
	students: RootDBState["students"]
	curr_class: MISClass
}

const LedgerPage : React.SFC < LedgerPageProp > = ({ relevant_payments, students, settings, curr_class }) => {

	return <div className="payment-history">
	{
		Object.entries(relevant_payments)
			.map(([s_id, {filteredPayments, owed}]) => {
			
			const curr_student = students[s_id]
			return <div className="payment-history section print-page">
			<PrintHeader settings={settings} logo={""}/>
			<div className="divider">Student Information</div>
				<div className="row info">
					<label> Name:</label>
					<div>{curr_student.Name}</div>
				</div>
				<div className="row info">
					<label> Father Name:</label>
					<div>{curr_student.ManName}</div>
				</div>
				<div className="row info">
					<label> Class Name:</label>
					<div>{curr_class.name}</div>
				</div>
				<div className="row info">
					<label> Roll #:</label>
					<div>{curr_student.RollNumber}</div>
				</div>
				<div className="row info">
					<label> Adm # :</label>
					<div>{curr_student.RollNumber}</div>
				</div>
				
			<div className="divider">Payment Information</div>

			<div className="table row heading">
				<label><b>Date</b></label>
				<label><b>Label</b></label>
				<label><b>Amount</b></label>
			</div>

			{filteredPayments
				.map(([id, payment]) => {

					return <div className="payment" key={s_id} >
						<div className="table row">
							<div>{moment(payment.date).format("DD/MM")}</div>
							<div>{payment.type === "SUBMITTED" ? "Payed" : payment.type === "FORGIVEN" ? "Need Scholarship" : payment.fee_name || "Fee"}</div>
							<div>{payment.type === "OWED" ? `${numberWithCommas(payment.amount)}` : `${numberWithCommas(payment.amount)}`}</div>
						</div>
					</div>
				}
			)}

			<div className="table row last">
				<label style={{ color: owed <= 0 ? "#5ECDB9" : "#FC6171" }}><b>{owed <= 0 ? "Advance:" : "Pending:"}</b></label>
				<div style={{ color: owed <= 0 ? "#5ECDB9" : "#FC6171" }}><b>{numberWithCommas( Math.abs(owed))}</b></div>
			</div>
			</div>
		})
	}
	</div>
}


