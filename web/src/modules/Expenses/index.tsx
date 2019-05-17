import React, { Component } from 'react'
import { LayoutWrap } from '../../components/Layout/index'
import { RouteComponentProps } from 'react-router';
import Former from '../../utils/former';

import './style.css'
import { connect } from 'react-redux';
import numberWithCommas from '../../utils/numberWithCommas';

interface P {

}

interface S {
  payment: {
    active: boolean
    amount: string
    type: string
    category: string
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
      payment:{
        active: false,
        amount: "0",
        type: "SUBMITTED",
        category: "SALARY",
        quantity: "1",
        label:"",
      }
    }

    this.former = new Former (this,[])
    }

  render() {
    return <div className="expenses">
            <div className="divider">Expense Information</div>
            <div className="table row">
              <label>Current Month Total:</label>
              <div>13700 Rs</div>
            </div>

            <div className="divider">Ledger</div>

            {/* <div className="filter row no-print"  style={{marginBottom:"10px"}}>
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
            <div className="expense-history section">
              <div className="table row heading">
                <label><b> Date   </b></label>
                <label><b> Label  </b></label>
                <label><b> Type   </b></label>
                <label><b> Quantity</b></label>
                <label><b> Amount </b></label>
              </div>
              <div className="table row">
                <label> 02-05-2019 </label>
                <label> test 1</label>
                <label> Utility </label>
                <label> 1 </label>
                <label> 5000 </label>
              </div>
              <div className="table row">
                <label> 03-05-2019 </label>
                <label> test 2</label>
                <label> Misc. </label>
                <label> 1 </label>
                <label> 8000 </label>
              </div>
              <div className="table row">
                <label> 07-05-2019 </label>
                <label> test 3 </label>
                <label> Salary(Jamal Khawaja) </label>
                <label> 1 </label>
                <label> 700 </label>
              </div>
              <div className="table row last">
                <label><b> Total</b></label>
                <div><b>{numberWithCommas(Math.abs(13700))}</b></div>
              </div>
            </div>
            <div className="form">
              <div className={`button ${this.state.payment.active ? "orange" : "green"}`} style={{marginTop:"10px"}}>{this.state.payment.active ? "Cancel" : "New Entry"}</div>

              
              <div className="new-payment">
                <div className="row">
                  <label>Amount</label>
                  <input type="number" {...this.former.super_handle(["payment", "amount"])} placeholder="Enter Amount" />
                </div>
                <div className="row">
                  <label>Type</label>
                  <select {...this.former.super_handle(["payment", "type"])}>
                    <option value="SUBMITTED">Payed</option>
                    <option value="FORGIVEN">Advance</option>
                  </select>
                </div>
                <div className="row">
                  <label>Category</label>
                  <select {...this.former.super_handle(["payment", "type"])}>
                    <option value="SUBMITTED">Salary</option>
                    <option value="FORGIVEN">Utility Bills</option>
                  </select>
                </div>
                <div className="row">
                  <label>Label</label>
                  <input type="number" {...this.former.super_handle(["payment", "label"])} placeholder="Enter Amount" />
                </div>
                <div className="row">
                  <label>Quantity</label>
                  <input type="number" {...this.former.super_handle(["payment", "quantity"])} placeholder="Enter Amount" />
                </div>

              <div className="button save">Add Payment</div>
              </div>
                <div className="print button" onClick={()=> window.print()} >Print Preview</div>
              </div>
         </div>
  }
}

export default connect ( (state: RootReducerState) => ({

}))( LayoutWrap(Expenses))
