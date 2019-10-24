import React, {Component} from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import { connect } from 'react-redux'
import moment from 'moment'
import queryString from 'querystring'
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
	date_format: string
}

	const ExpenseChart : React.SFC <ChartProps> = ({collective_obj, chartFilter, date_format}) => {
		return <ResponsiveContainer width="100%" height={200}>
			<LineChart
				data={
					Object.entries(collective_obj)
						.sort(([d1,], [d2,]) => moment(d1, date_format).diff(moment(d2, date_format)))
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
		date_format: string
	}
	
	const ExpenseTable: React.SFC<TableProps> = ({ collective_obj, total_income, total_expense, date_format }) => {
		return <div className="section table">
			<div className="table row heading">
				<label style={{ backgroundColor: "#efecec" }}> <b> Date </b></label>
				<label style={{ backgroundColor: "#bedcff" }}> <b> Income </b> </label>
				<label style={{ backgroundColor: "#e0e0e0" }}> <b> Expense </b> </label>
				<label style={{ backgroundColor: "#93d0c5" }}> <b> Profit </b> </label>
			</div>
			{
				[...Object.entries(collective_obj)
					.sort(([d1, ], [d2, ]) => moment(d1, date_format).diff(moment(d2, date_format)))
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
	is_payment_filter: boolean
	selected_period: string
	start_date: number,
	end_date: number,
}

interface routeInfo {
	id: string
}

type propTypes = RouteComponentProps<routeInfo> & P

class ExpenseAnalytics extends Component<propTypes, S> {

	former: Former
	constructor(props: propTypes) {
		super(props)

		const parsed_query = queryString.parse(this.props.location.search);
		const sd_param = parsed_query["?start_date"] || ""
		const ed_param = parsed_query["end_date"] || ""
		const period = parsed_query["period"] || ""

		const start_date =  sd_param !== "" ? moment(sd_param, "MM-DD-YYYY").unix() * 1000 : moment().subtract(1,'year').unix() * 1000
		const end_date = ed_param !=="" ? moment(ed_param, "MM-DD-YYYY").unix() * 1000 : moment().unix() * 1000

		this.state = {
			filterText: "",
			chartFilter: {
				income : true,
				expense: true,
				profit: true
			},
			start_date,
			end_date,
			is_payment_filter: false,
			selected_period: period !== "" ? period.toString() : "Monthly",
		}
		this.former = new Former(this, [])
	}

	calculateDebt = ({SUBMITTED, FORGIVEN, OWED, SCHOLARSHIP}:{ SUBMITTED: number, FORGIVEN: number, OWED : number, SCHOLARSHIP : number}) => SUBMITTED + FORGIVEN + SCHOLARSHIP - OWED;

	onStateChange = () => {

		const start_date = moment(this.state.start_date).format("MM-DD-YYYY")
		const end_date = moment(this.state.end_date).format("MM-DD-YYYY")
		const period = this.state.selected_period

		const url = '/analytics/expenses'
		const params = `start_date=${start_date}&end_date=${end_date}&period=${period}`

		window.history.replaceState(this.state, "Fee Analytics", `${url}?${params}`)
	}

	componentWillReceiveProps(nextProps : propTypes) { 

		const parsed_query = queryString.parse(nextProps.location.search);

		const sd_param = parsed_query["?start_date"] || ""
		const ed_param = parsed_query["end_date"] || ""
		const period = parsed_query["period"] || ""

		// set defaults if params are not passed
		const start_date =  sd_param !== "" ? moment(sd_param, "MM-DD-YYYY").unix() * 1000 : moment().subtract(1,'year').unix() * 1000
		const end_date = ed_param !=="" ? moment(ed_param, "MM-DD-YYYY").unix() * 1000 : moment().unix() * 1000
		const selected_period = period !=="" ? period.toString() : ""
		
		this.setState({
			start_date,
			end_date,
			selected_period
		})
	}

	render() {

	const {students, expenses ,settings, schoolLogo} = this.props

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
		}, {} as { [id:string]: MISStudentPayment })
	
	const filtered_expense = Object.entries(expenses)
		.filter(([id,e]) => e.type === "PAYMENT_GIVEN")
		.reduce((agg, [id, curr]) => {
			return {
				...agg,
				[id]: curr
			}
		}, {} as { [id:string]: MISExpense | MISSalaryExpense})

	const income_exp = {...students_payments, ...filtered_expense}

	let total_income = 0
	let total_expense = 0

	const temp_sd = moment(this.state.start_date)
	const temp_ed = moment(this.state.end_date)
	const period_format = this.state.selected_period === "Daily" ? "DD/MM/YYYY" : "MM/YYYY"

	const collective_obj = Object.values(income_exp)
		.filter( curr => moment(curr.date).isSameOrAfter(temp_sd) && moment(curr.date).isSameOrBefore(temp_ed))
		.reduce((agg, curr) => {
			const pay_month = moment(curr.date).format(period_format)

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
			logo={schoolLogo}/>

		<div className="divider">Payments over Time</div>

		<div className="no-print btn-filter-toggle row">
			<div className="button green" onClick={ () => this.setState({is_payment_filter: !this.state.is_payment_filter})}>Show Filters
			</div>
		</div>
		{ this.state.is_payment_filter && <div className="no-print section form">				
			<div className="row">
				<label> Start Date </label>
				<input type="date" 
					onChange={this.former.handle(["start_date"], () => true, this.onStateChange)} 
					value={moment(this.state.start_date).format("YYYY-MM-DD")} 
					max = {moment().format("YYYY-MM-DD")}/>
			</div>
			<div className="row">	
				<label> End Date </label>
				<input type="date" 
					onChange={this.former.handle(["end_date"], () => true, this.onStateChange)} 
					value={moment(this.state.end_date).format("YYYY-MM-DD")} 
					max = {moment().format("YYYY-MM-DD")}/>
			</div>
			<div className="row">
				<label> Payments Period </label>
				<select {...this.former.super_handle(["selected_period"], () => true, this.onStateChange)}>
						<option value="Daily">Daily</option>
						<option value="Monthly" selected>Monthly</option>
				</select>
			</div>
		</div>}

		<div className="no-print">
		<ExpenseChart 
			collective_obj={collective_obj}
			chartFilter={this.state.chartFilter}
			date_format={period_format}/>
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
		<ExpenseTable 
			collective_obj={collective_obj}
			total_income={total_income}
			total_expense={total_expense}
			date_format={period_format}/>
			
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
