import React, { Component } from 'react'
import Layout from 'components/Layout'
import {connect} from  'react-redux'
import former from 'utils/former'
import { smsIntentLink } from 'utils/intent'
import {logSms} from 'actions'
import {sendSMS} from 'actions/core'



class Help extends Component {
    constructor(props) {
      super(props)    
      
      this.state = {
        text: ""
      }

      this.former = new former(this, [])
    }

    logSms = () =>{
      const historyObj = {
        faculty: this.props.faculty_id,
        date: new Date().getTime(),
        type: "HELP",
        count: 1,
        text: this.state.text
      }
      
      this.props.logSms(historyObj)
    }
    
  render() {

    const { sendMessage, smsOption, auth , school_address} = this.props;
    const number = "03481112004"
    const text = `School Name : ${auth.school_id}\nSchool Address: ${school_address}\nTeacher Name: ${auth.name}\nMessage: ${this.state.text}`
    
    return (
      <Layout history={this.props.history}>
        <div className="help-page">
          <div className="form" style={{ width: "75%" }}>
            <div className="title">Help</div>
            <div className="section">
              <div style={{width: "inherit"}}>
                <h3>If you need any assistance, please call our customer representative or message us using the box below</h3>
              </div>

              <div style={{marginTop: "30px"}}>
                <li>
                  Customer Representative - <a href="tel:+923481112004">0348-111-2004</a>
                </li>
              </div>
            </div>
            <div className="divider">Ask Us</div>
              <div className="section">
                
                <div className="row">
                <label>Message</label>
                <textarea {...this.former.super_handle(["text"])} placeholder="Write message here" />
                </div>
                <div>
                {
                  smsOption === "SIM" ? 
                    <a href={smsIntentLink({
                      messages: [{ number, text }],
                      return_link: window.location.href 
                      })} onClick={this.logSms} className="button blue">Send using Local SIM</a> :
                  
                    <div className="button" onClick={() => sendMessage( text, number)}>Can only send using Local SIM</div>
                }
                </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }
}
export default connect(state => ({
  auth: state.auth,
  school_address: state.db.settings.schoolAddress,
  faculty_id: state.auth.faculty_id,
	connected: state.connected,
	smsOption: state.db.settings.sendSMSOption
}), dispatch => ({
	sendMessage: (text, number) => dispatch(sendSMS(text, number)),
	logSms: (faculty_id, history) => dispatch(logSms(faculty_id, history))
}))(Help);
