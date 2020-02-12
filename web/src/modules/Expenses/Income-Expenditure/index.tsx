import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router';
import Former from 'utils/former';
import { connect } from 'react-redux';
import numberWithCommas from 'utils/numberWithCommas'
import moment from 'moment';
import Banner from 'components/Banner';
import chunkify from 'utils/chunkify';
import { IncomeExpenditurePrintableList } from 'components/Printable/Expense/Other/list';
import { ProgressBar } from 'components/ProgressBar';

import '../style.css';

interface P {
	teachers: RootDBState["faculty"]
	expenses: RootDBState["expenses"]
	settings: RootDBState["settings"]
	students: RootDBState["students"]
	schoolLogo: RootDBState["assets"]["schoolLogo"]
}

interface collectiveOBJ {
	[id: string]: {
		amount: number
		quantity: number
		category: string
		label: string
		date: number
	}
}

interface S {
	banner: {
		active: boolean
		good: boolean
		text: string
	}
	loading: boolean
	collective_obj: collectiveOBJ
	total_income: number
	total_expense: number
	percentage: number
	monthFilter: string
	yearFilter: string
	Months: Set<any>
	Years: Set<any>
	viewBy: "DAILY" | "MONTHLY"
}

interface Routeinfo {
	id: string
}

type propTypes = RouteComponentProps<Routeinfo> & P

class IncomeExpenditure extends Component <propTypes, S> {

	former: Former
	background_calculation: NodeJS.Timeout
	constructor(props: propTypes) {
		super(props)

		this.state = {
			banner: {
				active: false,
				good: true,
				text: "Saved!"
			},
			loading: false,
			collective_obj: {},
			total_income: 0,
			total_expense: 0,
			percentage: 0,
			Months: new Set(),
			Years: new Set(),
			monthFilter: "",
			yearFilter: moment().format("YYYY"),
			viewBy: "MONTHLY"
		}
		this.former = new Former (this,[])
	}
	componentDidMount() {
		this.calculate()
	}
	componentWillReceiveProps() {
		this.calculate()
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
	calculate = () => {

		let i = 0;
		let j = 0;

		clearTimeout(this.background_calculation)

		this.setState({
			loading: true
		})

		const collective_obj: collectiveOBJ = {}

		let total_income = 0;
		let total_expense = 0;;

		const { students, expenses } = this.props
		const { monthFilter, yearFilter } = this.state

		const student_list = Object.values(students)
		const expense_list = Object.values(expenses)

		const Months  = new Set([])
		const Years = new Set([])

		const s_length = student_list.length
		const e_length = expense_list.length

		const month = monthFilter
		const year = yearFilter
		const viewBy = this.state.viewBy === "MONTHLY" ? "MM-YYYY" : "DD-MM-YY"

		const reducify = () => {

			const interval = Math.floor(s_length/10)
			if (i % interval === 0) {
				this.setState({
					percentage: (i / s_length) * 100
				})
			}

			if (i >= s_length && j >= e_length) {
				return this.setState({
					loading: false,
					collective_obj,
					total_income,
					total_expense,
					percentage: 0,
					Months,
					Years
				})
			}

			if (i < s_length) {

				const student = student_list[i];
				i += 1;

				for (const pid in student.payments || {}) {

					const payment = student.payments[pid]
					const inc_month = `INCOME-${moment(payment.date).format(viewBy)}`
					
					Months.add(moment(payment.date).format("MMMM"))
					Years.add(moment(payment.date).format("YYYY"))

					if (payment.type === "SUBMITTED" && this.getFilterCondition(year, month, payment))
					{
						collective_obj[inc_month] = collective_obj[inc_month] ?
							{
								...collective_obj[inc_month],
								amount: collective_obj[inc_month].amount + payment.amount,
								quantity: collective_obj[inc_month].quantity + 1,
							} : {
								amount: payment.amount,
								quantity: 1,
								category: "Fee",
								label: "PAID",
								date: payment.date
							}

						total_income += payment.amount
					}
				}
			}

			if (j < e_length) {

				const expense = expense_list[j]
				j += 1;
				
				if (expense.type === "PAYMENT_GIVEN" && this.getFilterCondition(year, month, expense)) {

					Months.add(moment(expense.date).format("MMMM"))
					Years.add(moment(expense.date).format("YYYY"))
					
					const inc_month = `EXPENSE-${moment(expense.date).format(viewBy)}-${expense.category}`
					const curr_amount = typeof (expense.amount) === "string" ? parseFloat(expense.amount) : expense.amount

					collective_obj[inc_month] = collective_obj[inc_month] ?
						{
							...collective_obj[inc_month],
							amount: collective_obj[inc_month].amount + (expense.expense === "SALARY_EXPENSE" ? expense.amount - expense.deduction : expense.amount),
							quantity: collective_obj[inc_month].quantity + 1
						} : {
							amount:  expense.expense === "SALARY_EXPENSE" ? expense.amount - expense.deduction : expense.amount,
							quantity: 1,
							category: expense.category,
							label: "EXPENSE",
							date: expense.date
						}

					total_expense += curr_amount
				}

			}
			this.background_calculation = setTimeout(reducify, 0)
		}
		this.background_calculation = setTimeout(reducify, 0)
	}

	render() {

		const { settings } = this.props
		const { percentage, collective_obj, total_income, total_expense, viewBy, Months, Years, banner, loading} = this.state

		const chunkSize = 22 // records per table

	return loading ? <ProgressBar percentage={percentage} /> : <div className="expenses page">

		{ banner.active ? <Banner isGood={banner.good} text={banner.text} /> : false }

		<div className="divider no-print">Income and Expenditure</div>

		<div className="filter row no-print" style={{marginBottom:"10px", flexWrap:"wrap"}}>
			<select {...this.former.super_handle(["monthFilter"], () => true, () => this.calculate())}>
				<option value="">Select Month</option>
				{
					[...Months].map( Month => {
						return <option key={Month} value={Month}>{Month}</option>	
					})
				}
			</select>

			<select {...this.former.super_handle(["yearFilter"], () => true, () => this.calculate())}>
				<option value="">Select Year</option>
				{
					[...Years].map( year => {
						return <option key={year} value={year}> {year} </option>
					})
				}
			</select>

			<select {...this.former.super_handle(["viewBy"], () => true, () => this.calculate())}>
				<option value="MONTHLY">Monthly View</option>
				<option value="DAILY">Daily View</option>
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
				Object.entries(this.state.collective_obj)
				.sort(([,a],[,b]) => a.date - b.date)
				.map(([id, e]) => {
					return <div key={id} className="table row">
						<label> {moment(e.date).format( viewBy === "DAILY" ? "DD-MM-YY" : "MM-YYYY") } </label>
						<label> {e.label} </label>
						<label> {e.category} </label>
						<label> {e.quantity === 1 ? `${e.quantity} Entry` : `${e.quantity} Entries`}</label>
						<label> {e.amount} </label>
					</div>
				})
			}
			<div className="table row last">
				<label><b>Income</b></label>
				<div><b>Rs. {numberWithCommas(total_income)}</b></div>
			</div>
			<div className="table row last">
				<label><b>Expense</b></label>
				<div><b>Rs. {numberWithCommas(total_expense)}</b></div>
			</div>
			<div className="table row last">
				<label><b>Profit</b></label>
				<div><b>Rs. {numberWithCommas(total_income - total_expense)}</b></div>
			</div>
		</div>
		{
			chunkify(Object.entries(collective_obj), chunkSize)
				.map((itemsChunk: any, index: number) => <IncomeExpenditurePrintableList key={index}
					items={itemsChunk}
					chunkSize={index === 0 ? 0 : chunkSize * index}
					schoolName={settings.schoolName}
					dateFormat={viewBy}
					/>
				)
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