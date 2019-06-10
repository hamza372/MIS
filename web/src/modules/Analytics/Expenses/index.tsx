import React, {Component} from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import { connect } from 'react-redux'
import moment from 'moment'

import { PrintHeader } from '../../../components/Layout'
import Former from '../../../utils/former'
import { numberWithCommas } from '../../../utils/numberWithCommas'

import { ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts"

import './style.css'

interface ChartProps {
	collective_obj: { [month: string]: { income: number, expense: number }}
	chartFilter: { 
		income : boolean
		expense: boolean
		profit: boolean
	}
}

	const MonthlyExpenseChart : React.SFC <ChartProps> = ({collective_obj, chartFilter}) => {
		return <ResponsiveContainer width="100%" height={200}>
			<LineChart
				data={
					Object.entries(collective_obj)
						.sort(([m1,], [m2,]) => moment(m1, "MM/YYYY").diff(moment(m2, "MM/YYYY")))
						.map(([month, { income, expense }]) => ({
							month, income, expense, profit: Math.abs(income - expense) 
						}))}>

				<XAxis dataKey="month" />
				<YAxis />
				<Tooltip />

				{ chartFilter.income && <Line dataKey='income' name="Income" stroke="#bedcff" strokeWidth={3} /> }
				{ chartFilter.expense && <Line dataKey="expense" stroke="#e0e0e0" name="Expense" strokeWidth={3}/> }
				{ chartFilter.profit && <Line dataKey="profit" stroke="#93d0c5" name="Profit" strokeWidth={3}/>}

			</LineChart>
		</ResponsiveContainer> 
	}

	interface TableProps {
		collective_obj: { [month: string]: { income: number, expense: number }}
		total_income: number 
		total_expense: number
	}
	
	const MonthlyExpenseTable: React.SFC<TableProps> = ({ collective_obj, total_income, total_expense }) => {
		return <div className="section table">
			<div className="table row heading">
				<label style={{ backgroundColor: "#efecec" }}> <b> Date </b></label>
				<label style={{ backgroundColor: "#bedcff" }}> <b> Income </b> </label>
				<label style={{ backgroundColor: "#e0e0e0" }}> <b> Expense </b> </label>
				<label style={{ backgroundColor: "#93d0c5" }}> <b> Profit </b> </label>
			</div>
			{
				[...Object.entries(collective_obj)
					.sort(([m1, ], [m2, ]) => moment(m1, "MM/YYYY").diff(moment(m2, "MM/YYYY")))
					.map(([month, { income, expense }]) => {

						const red = "#fc6171"
						return <div className="table row" key={month}>
							<div style={{ backgroundColor: "#efecec" }}>{month}</div>
							<div style={{ backgroundColor: "#bedcff" }}>{numberWithCommas(income)}</div>
							<div style={{ backgroundColor: "#e0e0e0" }}>{numberWithCommas(expense)}</div>
							<div style={{ backgroundColor: "#93d0c5" }}>{numberWithCommas(income - expense)}</div>
						</div>
					})
				]
			}
			<div className="table row footing">
			<br/> 
				<label style={{ backgroundColor: "#efecec" }}><b>Total</b></label>
				<label style={{ backgroundColor: "#bedcff" }}><b>{numberWithCommas(total_income)}</b></label>
				<label style={{ backgroundColor: "#e0e0e0" }}><b>{numberWithCommas(total_expense)}</b></label>
				<label style={{ backgroundColor: "#93d0c5" }}><b>{numberWithCommas(total_income - total_expense)}</b></label>
			</div>
		</div> 
	}

interface P {
	students: RootDBState["students"]
	settings: RootDBState["settings"]
	classes: RootDBState["classes"]
	expenses: RootDBState["expenses"]
	schoolLogo: RootDBState["assets"]["schoolLogo"] 
}

interface S {
	filterText: string
	chartFilter: {
		income : boolean
		expense: boolean
		profit: boolean
	}
	classFilter: string
}

interface routeInfo {
	id: string
}

type propTypes = RouteComponentProps<routeInfo> & P

class ExpenseAnalytics extends Component<propTypes, S> {

	former: Former
	constructor(props: propTypes) {
		super(props)

		this.state = {
			filterText: "",
			chartFilter: {
				income : true,
				expense: true,
				profit: true
			},
			classFilter: ""
		}
		this.former = new Former(this, [])
	}

	calculateDebt = ({SUBMITTED, FORGIVEN, OWED, SCHOLARSHIP}:{ SUBMITTED: number, FORGIVEN: number, OWED : number, SCHOLARSHIP : number}) => SUBMITTED + FORGIVEN + SCHOLARSHIP - OWED;

	render() {

	const {students, expenses ,settings, schoolLogo} = this.props

	const stu_payments = Object.entries(students)
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
		}, {} as { [id:string]: MISStudentPayment })
	
	const filtered_expense = Object.entries(expenses)
		.filter(([id,e]) => e.type === "PAYMENT_GIVEN")
		.reduce((agg, [id, curr]) => {
			return {
				...agg,
				[id]: curr
			}
		}, {} as { [id:string]: MISExpense | MISSalaryExpense})

	const income_exp = {...stu_payments, ...filtered_expense}

	let total_income = 0
	let total_expense = 0

	const collective_obj = Object.values(income_exp)
		.reduce((agg, curr) => {
			const pay_month = moment(curr.date).format("MM-YYYY")

			let inc_amount = agg[pay_month] && agg[pay_month].income || 0
			let exp_amount = agg[pay_month] && agg[pay_month].expense || 0

			if(curr.type === "SUBMITTED"){
				total_income += curr.amount
				inc_amount += curr.amount
			}
			else if(curr.type === "PAYMENT_GIVEN"){
				total_expense += curr.amount - (curr.expense === "SALARY_EXPENSE" ? curr.deduction: 0)
				exp_amount += curr.amount- (curr.expense === "SALARY_EXPENSE" ? curr.deduction: 0)
			}
			agg[pay_month] = { income: inc_amount, expense: exp_amount}
			
			return agg

		}, {} as { [month: string]: { income: number, expense: number}})

	return <div className="expense-analytics">

		<PrintHeader 
			settings={settings}
			logo={schoolLogo}
		/>
		
		<div className="no-print">
			<div className="divider">Payments over Time</div>
			<MonthlyExpenseChart 
				collective_obj = {collective_obj}
				chartFilter = {this.state.chartFilter}
			/>
		</div>
		
		<div className="no-print checkbox-container">
			
			<div className="chart-checkbox" style={{ color:"#bedcff" }}>
				<input
					type="checkbox" 
					{...this.former.super_handle([ "chartFilter", "income" ])}
				/>
				Income 
			</div>

			<div className="chart-checkbox" style={{ color:"#e0e0e0" }}>
				<input
					type="checkbox"
					{...this.former.super_handle([ "chartFilter", "expense" ])}
				/>
				Expense
			</div>

			<div className="chart-checkbox" style={{ color:"#93d0c5" }}>
				<input
					type="checkbox"
					{...this.former.super_handle([ "chartFilter", "profit" ])}
				/> 
				Profit
			</div>

		</div>

	<MonthlyExpenseTable collective_obj={collective_obj} total_income={total_income} total_expense={total_expense}/>

		<div className="print button" onClick={() => window.print()} style={{ marginTop: "10px" }}>Print</div>

	</div>
  }
}
export default connect((state: RootReducerState) => ({
	students: state.db.students,
	settings: state.db.settings,
	classes: state.db.classes,
	expenses: state.db.expenses,
	schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : "" 
}), (dispatch: Function) => ({

}))(ExpenseAnalytics)
