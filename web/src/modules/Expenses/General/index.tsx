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

interface P {
  teachers: RootDBState["faculty"]
  expenses: RootDBState["expenses"]
  settings: RootDBState["settings"]
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
  payment: {
    active: boolean
    amount: string
    type: string
    category: string
    faculty_id: string
    quantity: string
    label: string
  }
}

interface Routeinfo {
  id: string
}

type propTypes = RouteComponentProps<Routeinfo> & P

class Expenses extends Component <propTypes, S> {

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
      }
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
          this.props.addSalaryExpense( id, parseFloat(t.Salary), "SALARY", "PAYMENT_DUE", "SALARY", t.id )
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

  newPayment = () => {
    this.setState({ 
      payment: {
        ...this.state.payment,
        active: !this.state.payment.active,
        amount: "",
        label:"",
        type: "PAYMENT_GIVEN",
        category: "",
        faculty_id: "",
        quantity: "",
      }
    })
  }

  addPayment = () => {

    const payment = this.state.payment
    const id = `${moment().format("MM-YYYY")}-${payment.faculty_id}`

    let compulsoryFields
    if(this.state.payment.category && this.state.payment.category === "SALARY")
    {
      compulsoryFields = checkCompulsoryFields(this.state.payment, [
        ["amount"], ["type"], ["faculty_id"]
      ])
    }
    else if (this.state.payment.category){
      compulsoryFields = checkCompulsoryFields(this.state.payment, [
        ["amount"], ["label"], ["type"], ["quantity"]
      ])
    }
    else {
      compulsoryFields = checkCompulsoryFields(this.state.payment, [
        ["category"]
      ])
    }

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

    if(payment.category === "SALARY"){
      this.props.addSalaryExpense( id, parseFloat(payment.amount), this.props.teachers[payment.faculty_id].Name, "PAYMENT_GIVEN", payment.category, payment.faculty_id)
      console.log("Adding salary expense")

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
    console.log("Adding expense")
    this.props.addExpense( parseFloat(payment.amount), payment.label, "PAYMENT_GIVEN", payment.category, parseFloat(payment.quantity))
  }

  render() {

    const { expenses, teachers, settings, schoolLogo } = this.props

     return <div className="expenses">
          { this.state.banner.active ? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false }

          <PrintHeader settings={settings} logo={schoolLogo}/>
            <div className="divider">Expense Information</div>
            <div className="table row">
              <label>Current Month Total:</label>
              <div>{numberWithCommas(Object.values(expenses).reduce((agg, curr) => curr.type === "PAYMENT_GIVEN" ? agg + curr.amount : agg, 0))}</div>
            </div>

            <div className="divider">Ledger</div>

            {/* <div className="filter row no-print" style={{marginBottom:"10px"}}>
              <select className="" style={{ width: "150px" }}>
                <option value="">Select Month</option>
                <option value="May">May</option>
              </select>
              
              <select className="">
                <option value="">Select Year</option>
                <option value="2019"> 2019</option>
              </select>
		      	</div>
            */}
            <div className="payment-history section">
              <div className="table row heading">
                <label><b> Date   </b></label>
                <label><b> Label  </b></label>
                <label><b> Category   </b></label>
                <label><b> Quantity</b></label>
                <label><b> Amount </b></label>
              </div>

              {
                Object.values(expenses).map( e => {
                  if(e.expense === "SALARY_EXPENSE") {
                    <div className="table row">
                      <label> {moment(e.date).format("DD-MM-YYYY")} </label>
                      <label> {teachers[e.faculty_id].Name}</label>
                      <label> {e.category}</label>
                      <label> {`-`} </label>
                      <label> {numberWithCommas(e.amount)} </label>
                    </div>
                  }
                  else if (e.expense === "MIS_EXPENSE"){
                    <div className="table row">
                      <label> {moment(e.date).format("DD-MM-YYYY")} </label>
                      <label> {e.label}</label>
                      <label> {e.category}</label>
                      <label> {e.quantity } </label>
                      <label> {numberWithCommas(e.amount)} </label>
                  </div>
                  }
                })
              }
              <div className="table row last">
                <label><b> Total</b></label>
                <div><b>{Object.values(expenses).reduce((agg, curr) => curr.type === "PAYMENT_GIVEN" ? agg + curr.amount : agg, 0)}</b></div>
              </div>
            </div>
            <div className="form">
              <div className={`button ${this.state.payment.active ? "orange" : "green"}`} style={{marginTop:"10px"}} onClick={this.newPayment}>{this.state.payment.active ? "Cancel" : "New Entry"}</div>

              {this.state.payment.active && <div className="new-payment">
                <div className="row">
                  <label>Category</label>
                  <select {...this.former.super_handle(["payment", "category"])}>
                    <option value="">Select</option>                    
                    <option value="SALARY">Salary</option>
                    <option value="UTILITY_BILLS">Utility Bills</option>
                  </select>
                </div>
                { this.state.payment.category === "SALARY" && <div className="row">
                  <label> Teacher </label>
                  <select {...this.former.super_handle(["payment", "faculty_id"])}>
                    <option value=""> SELECT</option>
                    {
                      Object.values(this.props.teachers)
                      .map(t => {
                        return <option key={t.id} value={t.id}> {t.Name} </option>
                      })
                    }
                  </select>
                </div>}

                {this.state.payment.category !== "SALARY" && <div className="row">
                  <label>Label</label>
                  <input type="text" {...this.former.super_handle(["payment", "label"])} placeholder="Enter Name" />
                </div>}
                <div className="row">
                  <label>Amount</label>
                  <input type="number" {...this.former.super_handle(["payment", "amount"])} placeholder="Enter Amount" />
                </div>
                {this.state.payment.category !== "SALARY" && <div className="row">
                  <label>Quantity</label>
                  <input type="number" {...this.former.super_handle(["payment", "quantity"])} placeholder="Enter Quantity" />
                </div>}

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
  addExpense: (amount: number, label: string, type: string, category: string, quantity: number ) => dispatch(addExpense(amount, label, type, category, quantity )),
  addSalaryExpense: (id: string, amount: number, label: string, type: string, category: string, faculty_id: string) => dispatch(addSalaryExpense(id, amount, label, type, category, faculty_id))
}))( Expenses )
