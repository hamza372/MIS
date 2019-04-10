import React, { Component } from 'react'
import former from 'utils/former'
import checkCompulsoryFields from 'utils/checkCompulsoryFields'
import Banner from 'components/Banner'
import { createSignUp } from 'actions'
import {connect} from 'react-redux'

import './style.css'

class SignUp extends Component {

    constructor(props) {
      super(props)
    
      this.state = {
        profile:{
          name:"",
          phone:"",
          city:"",
          schoolName:"",
          packageName: "Taleem-1"
        },
        banner: {
          active: false,
          good: true,
          text: "Saved!"
        }
      }

      this.former = new former(this, [])
    }

    onSave = () => {

      const compulsoryFields = checkCompulsoryFields(this.state.profile, [
        ["name"], ["phone"]
      ]);

      if(compulsoryFields)
      {
        const errorText = "Please Fill " + compulsoryFields  + " !!!";

        return this.setState({
          banner:{
            active: true,
            good: false,
            text: errorText
          }
        })
      }

      this.props.createSignUp(this.state.profile)
    }
    
    componentWillReceiveProps(props) {
      const sign_up_form = props.sign_up_form

      if( sign_up_form.loading === false &&
        sign_up_form.succeed === false &&
        sign_up_form.reason !== "" ) 
      { 
        this.setState({
          banner:{
            active:true,
            good: false,
            text:"SignUp Failed, Please try again."
          }
        })
      }
      if( sign_up_form.loading === true) 
      { 
        this.setState({
          banner:{
            active:true,
            good: true,
            text:"LOADING"
          }
        })
      }
      if( sign_up_form.loading === false &&
        sign_up_form.succeed === true &&
        sign_up_form.reason === "" ) 
      { 
        this.setState({
          banner:{
            active:true,
            good: true,
            text:"Thanks for Signing-Up,We will get back to you"
          }
        })

        setTimeout(()=>{
          this.setState({
            banner:{
              active: false,
              good: true,
            }
          })
        }, 1000)
      }
    }


  render() {
    

    return (
      <div className=" section card sign-up">
	  	{ this.state.banner.active ? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false }
          <div className="row">
            <label> Name </label>
            <input type="text" {...this.former.super_handle(["profile","name"])}></input>
          </div>
          <div className="row">
            <label> Phone </label>
            <input type="text" {...this.former.super_handle(["profile","phone"])}></input>
          </div>
          <div className="row">
            <label> City/District </label>
            <input type="text" {...this.former.super_handle(["profile","city"])}></input>
          </div>
          <div className="row">
            <label> School Name </label>
            <input type="text" {...this.former.super_handle(["profile","schoolName"])}></input>
          </div>
          <div className="row">
            <label> Select Package </label>
            <select {...this.former.super_handle(["profile","packageName"])}>
              <option value="Taleem-1">Taleem-1</option>
              <option value="Taleem-2">Taleem-2</option>
              <option value="Taleem-3">Taleem-3</option>
            </select>
          </div>
          <div className="button red" onClick={() => this.onSave()}> Submit</div>

      </div>
    )
  }
}
export default connect(state => ({
  sign_up_form: state.sign_up_form
}), dispatch => ({
	createSignUp: (profile) => dispatch(createSignUp(profile)),
 }))(SignUp);