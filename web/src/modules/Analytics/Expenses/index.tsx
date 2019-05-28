import React, {Component} from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import { connect } from 'react-redux'
import moment from 'moment'

import { PrintHeader } from '../../../components/Layout'
import Former from '../../../utils/former'
import { numberWithCommas } from '../../../utils/numberWithCommas'

import { ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts"

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
						
						{ chartFilter.income && <Line dataKey='income' name="Income" stroke="#74aced" strokeWidth={3} /> }
						{ chartFilter.expense && <Line dataKey="expense" stroke="#93d0c5" name="Expense" strokeWidth={3}/> }
						{ chartFilter.profit && <Line dataKey="profit" stroke="#939292" name="Profit" strokeWidth={3}/>}

					</LineChart>
				</ResponsiveContainer> 
	}

	interface TableProps {
		collective_obj: { [month: string]: { income: number, expense: number }}
		total_income: number 
		total_expense: number
	}
	
	const MonthlyExpenseTable: React.SFC<TableProps> = ({ collective_obj, total_income, total_expense }) => {
	
		return <div className="section table" style={{margin: "20px 0", backgroundColor:"#c2bbbb21", overflowX: "scroll" }}>
				<div className="table row heading">
					<label style={{ backgroundColor: "#efecec", textAlign:"center" }}> <b> Date     </b></label>
					<label style={{ backgroundColor: "#bedcff", textAlign:"center" }}> <b> Income    </b> </label>
					<label style={{ backgroundColor: "#93d0c5", textAlign:"center" }}> <b> Expense     </b> </label>
					<label style={{ backgroundColor: "#e0e0e0", textAlign:"center" }}> <b> Profit </b> </label>
				</div>
				{
					[...Object.entries(collective_obj)
						.sort(([m1, ], [m2, ]) => moment(m1, "MM/YYYY").diff(moment(m2, "MM/YYYY")))
						.map(([month, { income, expense }]) => {

							const red = "#fc6171"
							return <div className="table row" key={month}>
								<div style={{ backgroundColor: "#efecec", textAlign:"center" }}>{month}</div>
								<div style={{ backgroundColor: "#bedcff", textAlign:"center" }}>{numberWithCommas(income)}</div>
								<div style={{ backgroundColor: "#93d0c5", textAlign:"center" }}>{numberWithCommas(expense)}</div>
								<div style={{ backgroundColor: "#e0e0e0", textAlign:"center" }}>{numberWithCommas(income - expense)}</div>
							</div>
						}),
						<div className="table row footing" style={{borderTop: '1.5px solid #333'}} key={Math.random()}>
						<br/> 
							<label style={{ backgroundColor: "#efecec", textAlign:"center" }}><b>Total</b></label>
							<label style={{ backgroundColor: "#bedcff", textAlign:"center" }}><b>{numberWithCommas(total_income)}</b></label>
							<label style={{ backgroundColor: "#93d0c5", textAlign:"center" }}><b>{numberWithCommas(total_expense)}</b></label>
							<label style={{ backgroundColor: "#e0e0e0", textAlign:"center" }}><b>{numberWithCommas(total_income - total_expense)}</b></label>
						</div>
					]
				}
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
	}, {})
	
	const filtered_expense = Object.entries(expenses)
	.filter(([id,e]) => e.type === "PAYMENT_GIVEN")
	.reduce((agg, [id, curr]) => {
		
		return {
			...agg,
			[id]: curr
		}
	}, {})

/* 
	const monthly_income : { [month: string]: number} = {}
	const monthly_expense : { [month: string]: number} = {}

	for( let s of Object.values(students)){
		if(!s.Name){
			console.log("Undefined Student")
			return
		}

		Object.values(s.payments)
		.filter(p => p.type === "SUBMITTED")
		.forEach(p => {

			console.log("payment =>", p)
			const pay_month = moment(p.date).format("MM-YYYY")
			
			let amount = monthly_income[pay_month] ? monthly_income[pay_month] : 0
			
			amount += p.amount
			
			monthly_income[pay_month] = amount
		});
	}
	 

	Object.values(expenses)
	.filter(e => e.type === "PAYMENT_GIVEN")
	.forEach(e => {

		const pay_month = moment(e.date).format("MM-YYYY")
		
		let amount = monthly_expense[pay_month] ? monthly_expense[pay_month] : 0
		
		amount += e.amount
		
		monthly_expense[pay_month] = amount
	});

	console.log("Monthly Expense =>", monthly_expense)
	console.log("Monthly income =>", monthly_income)
		
	 */
	const income_exp = {...stu_payments, ...filtered_expense} as MISStudentPayment | MISExpense | MISSalaryExpense

	let collective_obj : { [month: string]: { income: number, expense: number}} = {}

	Object.values(income_exp)
	.forEach(e => {
		const pay_month = moment(e.date).format("MM-YYYY")
		let inc_amount = collective_obj[pay_month] ? collective_obj[pay_month].income || 0 : 0
		let exp_amount = collective_obj[pay_month] ? collective_obj[pay_month].expense || 0 : 0

		if(e.type === "SUBMITTED"){
			inc_amount += e.amount
		}
		else {
			exp_amount += e.amount	
 		}

		collective_obj[pay_month] = { income: inc_amount, expense: exp_amount}
	})

	const income_exp_sorted = Object.values(income_exp)
		.sort((a, b) => a.date - b.date)

	const total_income = Object.values(income_exp_sorted).reduce((agg, curr) =>	curr.type === "SUBMITTED" ? agg + curr.amount : agg, 0)
	const total_expense = Object.values(income_exp_sorted).reduce((agg, curr) => curr.type === "PAYMENT_GIVEN" ? agg + curr.amount : agg, 0)

	return <div className="fees-analytics">

		<PrintHeader 
			settings={settings} 
			logo={schoolLogo}
		/>
		
		<div className="no-print" style={{ marginRight:"10px" }}>
			<div className="divider">Payments over Time</div>
			<MonthlyExpenseChart 
				collective_obj = {collective_obj}
				chartFilter = {this.state.chartFilter}
			/>
		</div>
		
		<div className="no-print checkbox-container">
			
			<div className="chart-checkbox" style={{ color:"#93d0c5" }}>
				<input
					type="checkbox" 
					{...this.former.super_handle([ "chartFilter", "income" ])}
				/>
				Income 
			</div>

			<div className="chart-checkbox" style={{ color:"#939292" }}>
				<input
					type="checkbox"
					{...this.former.super_handle([ "chartFilter", "expense" ])}
				/>
				Expense
			</div>

			<div className="chart-checkbox" style={{ color:"#ff6b68" }}>
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
