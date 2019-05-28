import React, { Component } from 'react'
import { RouteComponentProps } from 'react-router';
import Former from '../../../utils/former';

import '../style.css'
import { connect } from 'react-redux';
import checkCompulsoryFields from '../../../utils/checkCompulsoryFields'
import numberWithCommas from '../../../utils/numberWithCommas';
import { addExpense, addSalaryExpense } from '../../../actions'
import moment from 'moment'
import Banner from '../../../components/Banner';
import { PrintHeader } from '../../../components/Layout';
import { v4 } from 'node-uuid';

/**
 * Need to think about Advance Salary
 */

interface P {
  teachers: RootDBState["faculty"]
  expenses: RootDBState["expenses"]
  settings: RootDBState["settings"]
  students: RootDBState["students"]
  schoolLogo: RootDBState["assets"]["schoolLogo"]
  addExpense: (amount: number, label: string, type: string, category: string, quantity: number ) => any
  addSalaryExpense: (id: string, amount: number, label: string, type: string, category: string, faculty_id: string ) => any
}

interface S {
  	banner: {
		active: boolean
		good: boolean
		text: string
	}
	monthFilter: string
	yearFilter: string
}

interface Routeinfo {
  id: string
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
		yearFilter: ""
		
    }

    this.former = new Former (this,[])
  }

  componentDidMount () {

    console.log("LOADED Expenses")
    
    Object.values(this.props.teachers)
      .filter(t => t.Salary !== "")  
      .forEach(t => {
        const id = `${moment().format("MM-YYYY")}-${t.id}`
        if(!this.props.expenses[id])
        {
          //id, amount, label, type, category, faculty_id
          this.props.addSalaryExpense( id, parseFloat(t.Salary), this.props.teachers[t.id].Name, "PAYMENT_DUE", "SALARY", t.id )
          console.log("<================================>\n")
        } 
      })
  }

  checkSalaryExpenses = () => {

    Object.values(this.props.teachers).forEach(t => {

      const id = `${moment().format("MM-YYYY")}-${t.id}`

      if(this.props.expenses[id])
      {
        this.props.addSalaryExpense( id ,parseFloat(t.Salary), "SALARY", "PAYMENT_DUE", "SALARY", t.id )
      }

    })
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

	const { expenses, teachers, students, settings, schoolLogo } = this.props
	
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
	
	const income_exp = {...stu_payments, ...filtered_expense} as MISStudentPayment | MISExpense | MISSalaryExpense
	
	
	let Months  = new Set([])
	let Years = new Set([])

	for(let s of Object.values(income_exp)){

		Months.add(moment(s.date).format("MMMM"))
		Years.add(moment(s.date).format("YYYY"))
	}

	const income_exp_sorted = Object.values(income_exp)
		.filter(e => this.getFilterCondition(this.state.yearFilter, this.state.monthFilter, e))
		.sort((a, b) => a.date - b.date)

	const total_income = Object.values(income_exp_sorted).reduce((agg, curr) =>	curr.type === "SUBMITTED" ? agg + curr.amount : agg, 0)
	const total_expense = Object.values(income_exp_sorted).reduce((agg, curr) => curr.type === "PAYMENT_GIVEN" ? agg + curr.amount : agg, 0)

	const total_monthly_income = Object.values(income_exp).reduce((agg, curr) => curr.type === "SUBMITTED" ? agg + curr.amount : agg, 0)
	const total_monthly_expense = Object.values(income_exp).reduce((agg, curr) => curr.type === "PAYMENT_GIVEN" ? agg + curr.amount : agg, 0)

	console.log("Income Expense", income_exp)
		
	return <div className="expenses page">
          { this.state.banner.active ? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false }

          <PrintHeader settings={settings} logo={schoolLogo}/>
            <div className="divider">Income and Expenditure</div>
            <div className="table row">
              <label>Total Income:</label>
			  <div><b>{numberWithCommas(total_monthly_income)}</b></div>
            </div>
			<div className="table row">
              <label>Total Expense:</label>
			  <div><b>{numberWithCommas(total_monthly_expense)}</b></div>

            </div>

            <div className="divider">Ledger</div>

	        <div className="filter row no-print" style={{marginBottom:"10px"}}>
              <select className="" {...this.former.super_handle(["monthFilter"])} style={{ width: "150px" }}>
                <option value="">Select Month</option>
				{
					[...Months].map( Month => {
						return <option key={Month} value={Month}>{Month}</option>	
					})
				}
              </select>
              
              <select className="" {...this.former.super_handle(["yearFilter"])}>
                <option value="">Select Year</option>
				{
					[...Years].map( year => {
						return <option key={year} value={year}> {year} </option>
					})
				}
              </select>
		    </div>
            
            <div className="payment-history section">
              <div className="table row heading">
                <label><b> Date </b></label>
                <label><b> Label </b></label>
                <label><b> Category </b></label>
                <label><b> Quantity </b></label>
                <label><b> Amount </b></label>
              </div>

              {
				Object.values(income_exp_sorted)
				.map( e => {
                    return <div className="table row">
                      <label> {moment(e.date).format("DD-MM-YYYY")} </label>
                      <label> {e.label? e.label : e.type === "SUBMITTED" ? "PAID": "-" }</label>
                      <label> {e.category ? e.category : e.fee_name || "-"}</label>
                      <label> {e.quantity ? e.quantity : "1"} </label>
                      <label> {e.type === "PAYMENT_GIVEN" ? -1 * e.amount : e.amount}</label>
                    </div>
                })
              }
              <div className="table row last">
                <label><b>Income-expense</b></label>
				<div><b>{numberWithCommas(total_income - total_expense)}</b></div>
              </div>

            </div>
            <div className="print button" style={{marginTop:"5px"}} onClick={()=> window.print()} >Print</div>
         </div>
  }
}

export default connect ( (state: RootReducerState) => ({
  teachers: state.db.faculty,
  expenses: state.db.expenses,
  settings : state.db.settings,
  students: state.db.students,
  schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : ""
}), ( dispatch : Function ) => ({
  addExpense: (amount: number, label: string, type: string, category: string, quantity: number ) => dispatch(addExpense(amount, label, type, category, quantity )),
  addSalaryExpense: (id: string, amount: number, label: string, type: string, category: string, faculty_id: string) => dispatch(addSalaryExpense(id, amount, label, type, category, faculty_id))
}))( IncomeExpenditure )
