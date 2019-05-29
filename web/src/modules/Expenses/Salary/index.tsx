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
  schoolLogo: RootDBState["assets"]["schoolLogo"]
  addSalaryExpense: (id: string, amount: number, label: string, type: string, category: string, faculty_id: string, date: number ,advance: number, deduction: number) => any
}

interface S {
  banner: {
		active: boolean
		good: boolean
		text: string
	}
  payment: {
    active: boolean
    amount: string
    type: string
    category: string
    faculty_id: string
    quantity: string
    label: string
    advance: number
    deductions: string
  },
  monthFilter: string
  yearFilter: string
}

interface Routeinfo {
  id: string
}

type propTypes = RouteComponentProps<Routeinfo> & P

class Salary extends Component <propTypes, S> {

  former: Former
  constructor(props: propTypes) {
    super(props)

    this.state = {
      banner: {
				active: false,
				good: true,
				text: "Saved!"
			},
      payment:{
        active: false,
        amount: "",
        label:"",
        type: "PAYMENT_GIVEN",
        category: "",
        faculty_id: "",
        quantity: "",
        advance: 0,
        deductions: "0"
      },
      monthFilter: "",
      yearFilter: "",
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
          this.props.addSalaryExpense( id, parseFloat(t.Salary), this.props.teachers[t.id].Name, "PAYMENT_DUE", "SALARY", t.id, moment.now(),0, 0 )
          console.log("<================================>\n")
        } 
      })
  }

  newPayment = () => {
    this.setState({ 
      payment: {
        ...this.state.payment,
        active: !this.state.payment.active,
        amount: "",
        label:"",
        type: "PAYMENT_GIVEN",
        category: "SALARY",
        faculty_id: "",
        quantity: "",
      }
    })
  }

  addPayment = () => {

    const payment = this.state.payment
    const id = `${moment().format("MM-YYYY")}-${payment.faculty_id}`

    console.log("paymnet=>", payment)

    const compulsoryFields = checkCompulsoryFields(this.state.payment, [
      ["amount"], ["faculty_id"]
    ])

    if(compulsoryFields){
      const erroText = `Please Fill ${(compulsoryFields as string[][]).map(x => x[0] === "faculty_id" ? "Teacher" : x[0]).join(", ")} !`

      return this.setState({
        banner:{
          active: true,
          good: false,
          text: erroText
        }
      })
    }

    const salary_pre_exist = this.props.expenses[id]

    if(salary_pre_exist){
      
      if(salary_pre_exist.amount > parseFloat(payment.amount)) 
      {
        payment.advance = (salary_pre_exist.amount - parseFloat(payment.deductions)) - parseFloat(payment.amount)
      }
      else if(salary_pre_exist.amount < parseFloat(payment.amount))
      {
        payment.advance = (salary_pre_exist.amount - parseFloat(payment.deductions)) - parseFloat(payment.amount)
      }
    }

    this.props.addSalaryExpense( v4(), parseFloat(payment.amount), this.props.teachers[payment.faculty_id].Name, "PAYMENT_GIVEN", payment.category, payment.faculty_id, moment.now(), payment.advance, parseFloat(payment.deductions))

    this.setState({
      banner: {
        active: true,
        good: true,
        text: "Saved"
      }
    })

    setTimeout(() => {
      this.setState({
        banner:{
          ...this.state.banner,
          active: false
        }
      })
    }, 1000)
    return
  
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

    const { expenses, teachers, settings, schoolLogo } = this.props

    let Months  = new Set([])
    let Years = new Set([])

    for(let e of Object.values(expenses)){
      if(e.expense === "SALARY_EXPENSE")
      {
        Months.add(moment(e.date).format("MMMM"))
        Years.add(moment(e.date).format("YYYY"))
      }
    }

    const totalSalaryExpense = Object.values(expenses)
      .filter(e => e.expense === "SALARY_EXPENSE" && this.getFilterCondition(this.state.yearFilter, this.state.monthFilter,e))  
      .reduce((agg, curr) => agg + curr.amount, 0)

    const filteredSalaryExpense = Object.values(expenses)
      .filter(e => e.expense === "SALARY_EXPENSE" && this.getFilterCondition(this.state.yearFilter, this.state.monthFilter,e))  
      .reduce((agg, curr) => agg + curr.amount, 0)

     return <div className="expenses">
          { this.state.banner.active ? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false }

          <PrintHeader settings={settings} logo={schoolLogo}/>
            <div className="divider">Salary Information</div>
            <div className="table row">
              <label>Current Month Total:</label>
              <div>{numberWithCommas(totalSalaryExpense)}</div>
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
                <label><b> Date   </b></label>
                <label><b> Name  </b></label>
                <label><b> Base </b></label>
                <label><b> Adv/Deduc</b></label>
                <label><b> Amount </b></label>
              </div>

              {
                Object.values(expenses)
                .filter(e => e.expense === "SALARY_EXPENSE" && this.getFilterCondition(this.state.yearFilter, this.state.monthFilter,e))
                .sort((a,b)=> a.date - b.date)
                .map( e => {
                  if(e.expense === "SALARY_EXPENSE"){
                    return <div className={ e.type === "PAYMENT_DUE"? "table row no-print" : "table row"}>
                      <label> {moment(e.date).format("DD-MM-YY")} </label>
                      <label> {e.label}</label>
                      <label> <span style={ e.type === "PAYMENT_DUE" ? { color: "#fc6171"}: {color: "#5ecdb971"}}>{numberWithCommas(e.amount)}</span></label>
                      <label> {`${e.advance}/${e.deduction}`} </label>
                      <label> { numberWithCommas((e.amount - e.deduction) - e.advance)} </label>
                    </div>
                  }  
                })
              }
              <div className="table row last">
                <label><b> Total Paid:</b></label>
                <div><b>{numberWithCommas(filteredSalaryExpense)}</b></div>
              </div>
            </div>
            <div className="form">
              <div className={`button ${this.state.payment.active ? "orange" : "green"}`} style={{marginTop:"10px"}} onClick={this.newPayment}>{this.state.payment.active ? "Cancel" : "New Entry"}</div>

              {this.state.payment.active && <div className="new-payment">

                <div className="row">
                  <label> Teacher </label>
                  <select {...this.former.super_handle(["payment", "faculty_id"])}>
                    <option value=""> SELECT</option>
                    {
                      Object.values(teachers)
                      .map(t => {
                        return <option key={t.id} value={t.id}> {t.Name} </option>
                      })
                    }
                  </select>
                </div>

                <div className="row">
                  <label>Amount</label>
                  <input type="number" {...this.former.super_handle(["payment", "amount"])} placeholder="Enter Amount" />
                </div>

                <div className="row">
                  <label>Deductions</label>
                  <input type="number" {...this.former.super_handle(["payment","deductions"])} placeholder="Deductions(if any)" />
                </div>

                <div className="button save" onClick={this.addPayment}>Add Payment</div>
              </div> }
                <div className="print button" style={{marginTop:"5px"}} onClick={()=> window.print()} >Print</div>
              </div>
         </div>
  }
}

export default connect ( (state: RootReducerState) => ({
  teachers: state.db.faculty,
  expenses: state.db.expenses,
  settings : state.db.settings,
  schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : ""
}), ( dispatch : Function ) => ({
  addSalaryExpense: (id: string, amount: number, label: string, type: string, category: string, faculty_id: string, date: number, advance: number, deduction: number) => dispatch(addSalaryExpense(id, amount, label, type, category, faculty_id, date ,advance, deduction))
}))( Salary )
