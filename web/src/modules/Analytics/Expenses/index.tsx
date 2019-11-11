import React, { Component } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { connect } from 'react-redux'
import moment from 'moment'
import queryString from 'querystring'
import { PrintHeader } from 'components/Layout'
import Former from 'utils/former'
import { numberWithCommas } from 'utils/numberWithCommas'

import { ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts"

import './style.css'

interface ChartProps {
	collective_obj: { [month: string]: { income: number; expense: number } };
	chartFilter: {
		income: boolean;
		expense: boolean;
		profit: boolean;
	};
	date_format: string;
}

const ExpenseChart: React.SFC<ChartProps> = ({ collective_obj, chartFilter, date_format }) => {
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

			{chartFilter.income && <Line dataKey='income' name="Income" stroke="#bedcff" strokeWidth={3} />}
			{chartFilter.expense && <Line dataKey="expense" stroke="#e0e0e0" name="Expense" strokeWidth={3} />}
			{chartFilter.profit && <Line dataKey="profit" stroke="#93d0c5" name="Profit" strokeWidth={3} />}

		</LineChart>
	</ResponsiveContainer>
}

interface TableProps {
	collective_obj: { [month: string]: { income: number; expense: number } };
	total_income: number;
	total_expense: number;
	date_format: string;
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
				.sort(([d1,], [d2,]) => moment(d1, date_format).diff(moment(d2, date_format)))
				.map(([month, { income, expense }]) => {

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
			<br />
			<label style={{ backgroundColor: "#efecec" }}><b>Total</b></label>
			<label style={{ backgroundColor: "#bedcff" }}><b>{numberWithCommas(total_income)}</b></label>
			<label style={{ backgroundColor: "#e0e0e0" }}><b>{numberWithCommas(total_expense)}</b></label>
			<label style={{ backgroundColor: "#93d0c5" }}><b>{numberWithCommas(Math.round(total_income - total_expense))}</b></label>
		</div>
	</div>
}

interface P {
	students: RootDBState["students"];
	settings: RootDBState["settings"];
	classes: RootDBState["classes"];
	expenses: RootDBState["expenses"];
	schoolLogo: RootDBState["assets"]["schoolLogo"];
}

interface S {
	filterText: string;
	chartFilter: {
		income: boolean;
		expense: boolean;
		profit: boolean;
	};
	collective_obj: { [month: string]: { income: number; expense: number } };
	total_income: number;
	total_expense: number;
	is_payment_filter: boolean;
	selected_period: string;
	start_date: number;
	end_date: number;

	loading: boolean;
}

interface routeInfo {
	id: string;
}

type propTypes = RouteComponentProps<routeInfo> & P

class ExpenseAnalytics extends Component<propTypes, S> {

	former: Former
	background_calculation: NodeJS.Timeout

	constructor(props: propTypes) {
		super(props)

		const parsed_query = queryString.parse(this.props.location.search);
		const sd_param = parsed_query["?start_date"] || ""
		const ed_param = parsed_query["end_date"] || ""
		const period = parsed_query["period"] || ""

		const start_date = sd_param !== "" ? moment(sd_param, "MM-DD-YYYY").unix() * 1000 : moment().subtract(1, 'year').unix() * 1000
		const end_date = ed_param !== "" ? moment(ed_param, "MM-DD-YYYY").unix() * 1000 : moment().unix() * 1000

		this.state = {
			filterText: "",
			chartFilter: {
				income: true,
				expense: true,
				profit: true
			},
			collective_obj: {},
			total_income: 0,
			total_expense: 0,
			start_date,
			end_date,
			is_payment_filter: false,
			selected_period: period !== "" ? period.toString() : "Monthly",
			loading: true
		}
		this.former = new Former(this, [])
	}

	calculateDebt = ({ SUBMITTED, FORGIVEN, OWED, SCHOLARSHIP }: { SUBMITTED: number; FORGIVEN: number; OWED: number; SCHOLARSHIP: number }) => SUBMITTED + FORGIVEN + SCHOLARSHIP - OWED;

	componentDidMount() {
		this.calculate()
	}

	onStateChange = () => {
		const start_date = moment(this.state.start_date).format("MM-DD-YYYY")
		const end_date = moment(this.state.end_date).format("MM-DD-YYYY")
		const period = this.state.selected_period

		const url = '/analytics/expenses'
		const params = `start_date=${start_date}&end_date=${end_date}&period=${period}`

		window.history.replaceState(this.state, "Fee Analytics", `${url}?${params}`)
		this.calculate()
	}

	componentWillReceiveProps(nextProps: propTypes) {

		const parsed_query = queryString.parse(nextProps.location.search);

		const sd_param = parsed_query["?start_date"] || ""
		const ed_param = parsed_query["end_date"] || ""
		const period = parsed_query["period"] || ""

		// set defaults if params are not passed
		const start_date = sd_param !== "" ? moment(sd_param, "MM-DD-YYYY").unix() * 1000 : moment().subtract(1, 'year').unix() * 1000
		const end_date = ed_param !== "" ? moment(ed_param, "MM-DD-YYYY").unix() * 1000 : moment().unix() * 1000
		const selected_period = period !== "" ? period.toString() : ""

		this.setState({
			start_date,
			end_date,
			selected_period
		})

		this.calculate()
	}

	calculate = () => {

		let i = 0;
		let j = 0;

		clearTimeout(this.background_calculation)

		this.setState({
			loading: true
		})

		const collective_obj: { [month: string]: { income: number; expense: number } } = {}

		let total_income = 0;
		let total_expense = 0;;

		const { students, expenses } = this.props

		const student_list = Object.values(students)
		const expense_list = Object.values(expenses)

		const s_length = student_list.length
		const e_length = expense_list.length

		const period_format = this.state.selected_period === "Daily" ? "DD/MM/YY" : "MM/YYYY"

		const start_date = moment(this.state.start_date)
		const end_date = moment(this.state.end_date)

		const reducify = () => {

			if (i >= s_length && j >= e_length) {
				return this.setState({
					loading: false,
					collective_obj,
					total_income,
					total_expense
				})
			}

			if (i < s_length) {

				const student = student_list[i];
				i += 1;

				for (const pid in student.payments || {}) {

					const payment = student.payments[pid]
					const inc_month = moment(payment.date).format(period_format)

					if (payment.type === "SUBMITTED"
						&& moment(payment.date).isSameOrAfter(start_date,"day")
						&& moment(payment.date).isSameOrBefore(end_date,"day")) {
						collective_obj[inc_month] = collective_obj[inc_month] ?
							{
								income: collective_obj[inc_month].income + payment.amount,
								expense: collective_obj[inc_month].expense
							} : {
								income: payment.amount,
								expense: 0
							}

						total_income += payment.amount
					}
				}
			}

			if (j < e_length) {

				const expense = expense_list[j]
				j += 1;

				if (expense.type === "PAYMENT_GIVEN"
					&& moment(expense.date).isSameOrAfter(start_date,"day")
					&& moment(expense.date).isSameOrBefore(end_date,"day")) {
					const inc_month = moment(expense.date).format(period_format)
					const curr_amount = typeof (expense.amount) === "string" ? parseFloat(expense.amount) : expense.amount

					collective_obj[inc_month] = collective_obj[inc_month] ?
						{
							income: collective_obj[inc_month].income,
							expense: collective_obj[inc_month].expense + curr_amount
						} : {
							income: 0,
							expense: expense.amount
						}

					total_expense += curr_amount
				}
			}
			this.background_calculation = setTimeout(reducify, 0)
		}

		this.background_calculation = setTimeout(reducify, 0)
	}

	render() {

		const { settings, schoolLogo } = this.props

		const period_format = this.state.selected_period === "Daily" ? "DD/MM/YYYY" : "MM/YYYY"

		return <div className="expense-analytics">

			<PrintHeader
				settings={settings}
				logo={schoolLogo} />

			{this.state.loading && <div> Calculating... </div>}

			<div className="divider">Payments over Time</div>

			<div className="no-print btn-filter-toggle row">
				<div className="button green" onClick={() => this.setState({ is_payment_filter: !this.state.is_payment_filter })}>Show Filters
			</div>
			</div>
			{this.state.is_payment_filter && <div className="no-print section form">
				<div className="row">
					<label> Start Date </label>
					<input type="date"
						onChange={this.former.handle(["start_date"], () => true, this.onStateChange)}
						value={moment(this.state.start_date).format("YYYY-MM-DD")}
						max={moment().format("YYYY-MM-DD")} />
				</div>
				<div className="row">
					<label> End Date </label>
					<input type="date"
						onChange={this.former.handle(["end_date"], () => true, this.onStateChange)}
						value={moment(this.state.end_date).format("YYYY-MM-DD")}
						max={moment().format("YYYY-MM-DD")} />
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
					collective_obj={this.state.collective_obj}
					chartFilter={this.state.chartFilter}
					date_format={period_format} />
			</div>

			<div className="no-print checkbox-container">
				<div className="chart-checkbox" style={{ color: "#bedcff" }}>
					<input
						type="checkbox"
						{...this.former.super_handle(["chartFilter", "income"])}
					/>
					Income
			</div>
				<div className="chart-checkbox" style={{ color: "#e0e0e0" }}>
					<input
						type="checkbox"
						{...this.former.super_handle(["chartFilter", "expense"])}
					/>
					Expense
			</div>
				<div className="chart-checkbox" style={{ color: "#93d0c5" }}>
					<input
						type="checkbox"
						{...this.former.super_handle(["chartFilter", "profit"])}
					/>
					Profit
			</div>
			</div>
			<ExpenseTable
				collective_obj={this.state.collective_obj}
				total_income={this.state.total_income}
				total_expense={this.state.total_expense}
				date_format={period_format} />

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
