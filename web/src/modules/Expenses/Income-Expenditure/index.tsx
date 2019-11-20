import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router';
import Former from 'utils/former';
import { connect } from 'react-redux';
import numberWithCommas from 'utils/numberWithCommas'
import moment from 'moment';
import Banner from 'components/Banner';
import chunkify from 'utils/chunkify';
import { IncomeExpenditurePrintableList } from 'components/Printable/Expense/Other/list';

import '../style.css';

interface P {
	teachers: RootDBState["faculty"];
	expenses: RootDBState["expenses"];
	settings: RootDBState["settings"];
	students: RootDBState["students"];
	schoolLogo: RootDBState["assets"]["schoolLogo"];
}

interface S {
	banner: {
		active: boolean;
		good: boolean;
		text: string;
	};
	monthFilter: string;
	yearFilter: string;
	categoryFilter: string;
}

interface Routeinfo {
	id: string;
}

type propTypes = RouteComponentProps<Routeinfo> & P

class IncomeExpenditure extends Component <propTypes, S> {

	former: Former
	constructor(props: propTypes) {
		super(props)

		this.state = {
			banner: {
			active: false,
			good: true,
			text: "Saved!"
		},
		monthFilter: "",
		yearFilter: moment().format("YYYY"),
		categoryFilter: ""
		}
		this.former = new Former (this,[])
	}

	getFilterCondition = (year: string, month: string, payment: any) =>
	{
		//when both are empty
		if(month === "" && year === "") {
			return true
		}
		//when month is empty	
		if(month === "" && year !== ""){
			return  moment(payment.date).format("YYYY") === year;
		}
		//when year is empty
		if(month !== "" && year === ""){
			return moment(payment.date).format("MMMM") === month
		}
		//when both are not empty
		if(month !== "" && year !== "")
		{
			return moment(payment.date).format("MMMM") === month && moment(payment.date).format("YYYY") === year;
		}
	}

	render() {

		const { expenses, students, settings } = this.props

		const chunkSize = 22 // records per table

		const students_payments = Object.entries(students)
			.filter(([id, s]) => s.Name)
			.reduce((prev,[id, s]) => {

				const curr_pay = Object.entries(s.payments)
					.filter(([, curr]) => curr.type === "SUBMITTED")
					.reduce((prev, [id, curr]) => {
						return {
							...prev,
							[id]: curr
						}
					}, {})

				return {
					...prev,
					...curr_pay
					}

			}, {} as { [id: string]: MISStudentPayment })

		const filtered_expense = Object.entries(expenses)
			.filter(([id,e]) => e.type === "PAYMENT_GIVEN")
			.reduce((agg, [id, curr]) => {

				return {
					...agg,
					[id]: curr
				}

			}, {} as { [id: string]: MISExpense | MISSalaryExpense})

		const income_exp = {...students_payments, ...filtered_expense}

		const Months  = new Set([])
		const Years = new Set([])

		for(const s of Object.values(income_exp)){
			Months.add(moment(s.date).format("MMMM"))
			Years.add(moment(s.date).format("YYYY"))
		}

		const income_exp_sorted = Object.values(income_exp)
			.filter(e => this.getFilterCondition(this.state.yearFilter, this.state.monthFilter, e) &&
				e.type === "PAYMENT_GIVEN" && (this.state.categoryFilter !=="" ? this.state.categoryFilter === e.category : true))
			.sort((a, b) => a.date - b.date)

		let total_income = 0
		let total_expense = 0
		let total_monthly_income = 0
		let total_monthly_expense = 0

		Object.values(income_exp).forEach(i => {

			if(i.type === "SUBMITTED")
			{
				total_income += i.amount

				if(this.getFilterCondition(this.state.yearFilter, this.state.monthFilter, i)) {
					total_monthly_income += i.amount
				}
			}
			else if(i.type === "PAYMENT_GIVEN")
			{
				total_expense += i.amount - ((i.expense === "SALARY_EXPENSE" && i.deduction) || 0)
				
				if(this.getFilterCondition(this.state.yearFilter, this.state.monthFilter, i) && ( this.state.categoryFilter !== "" ? this.state.categoryFilter === i.category: true)){
					total_monthly_expense += i.amount - ((i.expense === "SALARY_EXPENSE" && i.deduction) || 0)
				}
			}
		})

	return <div className="expenses page">

		{ this.state.banner.active ? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false }

		<div className="divider no-print">Income and Expenditure</div>
		
		<div className="table row no-print">
			<label>Total Income:</label>
			<div><b>Rs. {numberWithCommas(total_income)}</b></div>
		</div>
		
		<div className="table row no-print">
			<label>Total Expense:</label>
				<div><b>Rs. {numberWithCommas(total_expense)}</b></div>
		</div>

		<div className="table row no-print">
			<label>Profit:</label>
			<div><b>Rs. {numberWithCommas(total_income-total_expense)}</b></div>
		</div>

		<div className="divider no-print">Ledger</div>

		<div className="filter row no-print" style={{marginBottom:"10px", flexWrap:"wrap"}}>
			<select {...this.former.super_handle(["monthFilter"])}>
				<option value="">Select Month</option>
				{
					[...Months].map( Month => {
						return <option key={Month} value={Month}>{Month}</option>	
					})
				}
			</select>

			<select {...this.former.super_handle(["yearFilter"])}>
				<option value="">Select Year</option>
				{
					[...Years].map( year => {
						return <option key={year} value={year}> {year} </option>
					})
				}
			</select>


			<select {...this.former.super_handle(["categoryFilter"])}>
				<option value="">Select Category</option>
				<option value="SALARY">Salary</option>
				<option value="BILLS">Utility Bills</option>
				<option value="STATIONARY">Stationary</option>
				<option value="REPAIRS">Repairs</option>
				<option value="RENT">Rent</option>
				<option value="ACTIVITY">Student Activity</option>
				<option value="DAILY">Daily</option>
				<option value="PETTY_CASH">Petty Cash</option>
			</select>
		</div>

		<div className="payment-history no-print section">
			<div className="table row heading">
				<label><b> Date </b></label>
				<label><b> Label </b></label>
				<label><b> Category </b></label>
				<label><b> Quantity </b></label>
				<label><b> Amount </b></label>
			</div>
			{
				Object.entries(income_exp_sorted)
				.map(([id, e]) => {
					return <div key={id} className="table row">
						<label> { moment(e.date).format("DD-MM-YY")} </label>
						<label> { e.type === "PAYMENT_GIVEN" ? e.label : e.type === "SUBMITTED" ? "PAID": "-" }</label>
						<label> { e.type === "PAYMENT_GIVEN" ? e.category : (e.type === "SUBMITTED" && e.fee_name) || "-"}</label>
						<label> { e.type === "PAYMENT_GIVEN" && e.expense === "MIS_EXPENSE" ? e.quantity : "-"} </label>
						<label> { e.type === "PAYMENT_GIVEN" ? (e.amount - (e.expense === "SALARY_EXPENSE" ? e.deduction : 0)) : e.amount}</label>
					</div>
				})
			}
			<div className="table row last">
				<label><b>Income</b></label>
				<div><b>Rs. {numberWithCommas(total_monthly_income)}</b></div>
			</div>
			<div className="table row last">
				<label><b>Expense</b></label>
				<div><b>Rs. {numberWithCommas(total_monthly_expense)}</b></div>
			</div>
			<div className="table row last">
				<label><b>Profit</b></label>
				<div><b>Rs. {numberWithCommas(total_monthly_income - total_monthly_expense)}</b></div>
			</div>
		</div>
		{
			chunkify(Object.entries(income_exp_sorted), chunkSize)
						.map((itemsChunk: any, index: number) => <IncomeExpenditurePrintableList key={index}
							items={itemsChunk}
							chunkSize={index === 0 ? 0 : chunkSize * index}
							schoolName={settings.schoolName}/>)
		}
		<div className="print button" style={{marginTop:"5px"}} onClick={() => window.print()} >Print</div>
	</div>
	}
}

export default connect ( (state: RootReducerState) => ({
	teachers: state.db.faculty,
	expenses: state.db.expenses,
	settings : state.db.settings,
	students: state.db.students,
	schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : ""
}))( IncomeExpenditure )