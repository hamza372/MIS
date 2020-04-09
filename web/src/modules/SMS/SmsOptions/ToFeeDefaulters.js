import React, { Component } from 'react'
import { smsIntentLink } from 'utils/intent'
import former from 'utils/former'
import ShareButton from 'components/ShareButton'


class ToFeeDefaulters extends Component {
	constructor(props) {
	super(props)
	
	this.state = {
		text: "",
		total_student_debts: {}
	}
	
	this.background_calculation = null
	this.former = new former(this, [])
}

	logSms = (messages) =>{
		if(messages.length === 0){
			console.log("No Message to Log")
			return
		}
		const historyObj = {
			faculty: this.props.faculty_id,
			date: new Date().getTime(),
			type: "FEE_DEFAULTERS",
			count: messages.length,
			text: this.state.text
		}

		this.props.logSms(historyObj)
	}

	calculateDebt = ({ SUBMITTED, FORGIVEN, OWED, SCHOLARSHIP }) => (SUBMITTED + FORGIVEN + SCHOLARSHIP - OWED) * -1;

	calculate = () => {

		clearTimeout(this.background_calculation)

		let i = 0;
		
		const total_student_debts = {}
		const student_list = Object.values(this.props.students)

		const reducify = () => {

			// in loop
			if(i >= student_list.length) {
				return this.setState({
					total_student_debts
				})
			}

			const student = student_list[i];
			const sid = student.id;

			i += 1;

			const debt = { OWED: 0, SUBMITTED: 0, FORGIVEN: 0, SCHOLARSHIP: 0}
			
			for(const pid in student.payments || {}) {
				const payment = student.payments[pid];

				// some payment.amount has type string
				const amount =  typeof(payment.amount) === "string" ? parseFloat(payment.amount) : payment.amount
				
				// for 'scholarship', payment has also type OWED and negative amount
				if(amount < 0) {
					debt["SCHOLARSHIP"] += Math.abs(amount)
				} else {
					debt[payment.type] += amount
				}
			}

			if(student.FamilyID) {
				const existing = total_student_debts[student.FamilyID]
				if(existing) {
					total_student_debts[student.FamilyID] = {
						student,
						debt: {
							OWED: existing.debt.OWED + debt.OWED,
							SUBMITTED: existing.debt.SUBMITTED + debt.SUBMITTED,
							FORGIVEN: existing.debt.FORGIVEN + debt.FORGIVEN,
							SCHOLARSHIP: existing.debt.SCHOLARSHIP + debt.SCHOLARSHIP
						},
						familyId: student.FamilyID
					}
				} else {
					total_student_debts[student.FamilyID] = { student, debt, familyId: student.FamilyID }
				}
			} else {
				total_student_debts[sid] = { student, debt };
			}

			this.background_calculation = setTimeout(reducify, 0);
		}

		this.background_calculation = setTimeout(reducify, 0)
	}

	componentDidMount() {
		// calculating students debt
		this.calculate()
	}

	render() {

	const { sendBatchMessages, smsOption } = this.props;
	
	const messages = Object.values(this.state.total_student_debts)
		.filter(({student, debt}) => {
			return student.id !==undefined && student.Phone !== undefined &&
				(student.tags === undefined || !student.tags["PROSPECTIVE"]) &&
				this.calculateDebt(debt) > 0
		})
		.reduce((agg, {student, debt}) => {

			const index  = agg.findIndex(s => s.number === student.Phone)		
			
			if(index >= 0 ) {
				return agg
			}

			const balance = this.calculateDebt(debt)

			return [...agg, {
				number: student.Phone,
				text : this.state.text
				.replace(/\$BALANCE/g, `${balance}`)
				.replace(/\$NAME/g, student.FamilyID || student.Name)
				.replace(/\$FNAME/g, student.ManName)
			}]
		}, [])

	return (
			<div>
				<div className="row">
					<label>Message</label>
					<textarea {...this.former.super_handle(["text"])} placeholder="Write text message here" />
				</div>
				<div className="row">
					<label>Options</label>
					<div style={{fontSize: "0.85rem", color: "grey"}}>use $NAME, $FNAME and $BALANCE</div>
				</div>
					{
						smsOption === "SIM" ? 
							<a href={smsIntentLink({
								messages,
								return_link: window.location.href 
								})} onClick={() => this.logSms(messages)} className="button blue">Send using Local SIM</a> :

							<div className="button" onClick={() => sendBatchMessages(messages)}>Can only send using Local SIM</div>
					}
				<div className="is-mobile-only" style={{marginTop: 10}}>
					<div className="text-center">Share on Whatsapp</div>
					<ShareButton text={this.state.text} />
				</div>
			</div>
		)
  }
}

export default ToFeeDefaulters;