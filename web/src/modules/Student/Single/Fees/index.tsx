import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps, Link } from 'react-router-dom'
import moment from 'moment'
import {v4} from 'node-uuid'
import former from 'utils/former';
import Layout, { PrintHeader } from 'components/Layout'
import Banner from 'components/Banner'
import { addMultiplePayments, addPayment, logSms, editPayment } from 'actions'
import { sendSMS } from 'actions/core'
import { checkStudentDuesReturning } from 'utils/checkStudentDues'
import { smsIntentLink } from 'utils/intent'
import { numberWithCommas } from 'utils/numberWithCommas'	
import { getFeeLabel } from 'utils/getFeeLabel'
import { getFilteredPayments } from 'utils/getFilteredPayments'
import { sortYearMonths } from 'utils/sortUtils'

import './style.css'

type payment = {
	student: MISStudent;
	payment_id: string;
} & MISStudentPayment

interface P {
	faculty_id: RootReducerState["auth"]["faculty_id"];
	students: RootDBState["students"];
	connected: RootReducerState["connected"];
	settings: RootDBState["settings"];
	feeSMSTemplate: RootDBState["sms_templates"]["fee"];
	schoolLogo: RootDBState["assets"]["schoolLogo"];
	addPayment: (student: MISStudent, id: string, amount: number, date: number, type: MISStudentPayment["type"], fee_id?: string, fee_name?: string) => any;
	addMultiplePayments: (payments: payment[] ) => any;
	sendSMS: (text: string, number: string) => any;
	logSms: (history: any) => any;
	editPayment: (payments: AugmentedMISPaymentMap) => any;
 }

interface S {
	banner: {
		active: boolean;
		good: boolean;
		text: string;
	};
	payment: {
		active: boolean;
		amount: string;
		type: "SUBMITTED" | "FORGIVEN";
		sendSMS?: boolean;
	};
	month: string;
	year: string;
	edits: AugmentedMISPaymentMap
}

interface RouteInfo {
	id: string;
	famId: string
}

type propTypes = RouteComponentProps<RouteInfo> & P



class StudentFees extends Component <propTypes, S> {

	Former: former
	constructor(props: propTypes) {
		super(props);

		const current_month = moment().format("MM/YYYY")
		const edits = Object.entries(this.mergedPayments())
			.filter(([id,payment]) => moment(payment.date).format("MM/YYYY") === current_month && payment.type !== "SUBMITTED")
			.reduce((agg,[id,payment]) => {
				return {
					...agg,
					[id]: {
						...payment,
						student_id: payment.student_id,
						edited: false
					}
				}
			}, {} as AugmentedMISPaymentMap)

		this.state = {
			banner: {
				active: false,
				good: true,
				text: "Saved!"
			},
			payment: {
				active: false,
				amount: "",
				type: "SUBMITTED", // submitted or owed
				sendSMS: false
			},
			month: "",
			year: moment().format("YYYY"),
			edits
		}

		this.Former = new former(this, []);
	}

	student = (): MISStudent => {
		const id = this.props.match.params.id;
		return id === undefined ? this.siblings()[0] : this.props.students[id]
	}

	familyID = (): string =>  {
		const famId = this.props.match.params.famId || this.student().FamilyID
		return famId;
	}

	siblings = (): MISStudent[] => {
		const famId = this.familyID()
		return Object.values(this.props.students)
			.filter(s => s && s.Name && s.FamilyID && s.FamilyID === famId)
	}

	paymentEditTracker = (pid: string) => () => {
		this.setState({
			edits: {
				...this.state.edits,
				[pid]: {
					...this.state.edits[pid],
					edited: true
				}
			}
		})
	}

	mergedPayments = () => {

		const siblings = this.siblings()
		if(siblings.length > 0) {

			const merged_payments = siblings.reduce((agg, curr) => ({
				...agg,
				...Object.entries(curr.payments).reduce((agg, [pid, p]) => { 
					return {
						...agg,
						[pid]: {
							...p,
							fee_name: p.fee_name && `${curr.Name}-${p.fee_name}`,
							student_id: curr.id
						}
					}
				}, {})
			}), {} as AugmentedMISPaymentMap)

			return merged_payments;

		}

		return Object.entries(this.student().payments)
			.reduce((agg, [pid, curr]) => ({
				...agg,
				[pid]: {
					...curr,
					student_id: this.student().id,
					edited: false
				}
			}), {} as AugmentedMISPaymentMap)
	}
	
	getFees = () => {
		
		const siblings = this.siblings()
		if(siblings.length > 0) {
			const agg_fees = siblings
				.reduce((agg, curr) => ({
					...agg,
					...Object.entries(curr.fees)
						.reduce((agg, [fid, f]) => { 
							return {
								...agg,
								[fid]: {
									...f
								}
							}
						}, {} as MISStudent['fees'])
				}), {} as { [id: string]: MISStudentFee})

			return agg_fees;
		}
		
		return this.student().fees
    }

	newPayment = () => {
		this.setState({ 
			payment: {
				active: !this.state.payment.active,
				amount: "",
				type: "SUBMITTED"
			}
		})
	}

	addPayment = () => {
		// dispatch addPayment action 

		if(this.state.payment.amount === "") {
			return
		}

		const id = v4();
		const payment: MISStudentPayment = {
			amount: parseFloat(this.state.payment.amount),
			type: this.state.payment.type,
			date: new Date().getTime()
		}

		const balance = [...Object.values(this.mergedPayments()), payment]
					.reduce((agg, curr) => agg - (curr.type === "SUBMITTED" || curr.type === "FORGIVEN" ? 1 : -1) * curr.amount, 0)

		const student = this.student()

		if(this.state.payment.sendSMS) {
			// send SMS with replace text for regex etc.
			console.log("SENDING MESSAGE", this.state.payment.sendSMS)
			const message = this.props.feeSMSTemplate
					.replace(/\$BALANCE/g, `${balance}`)
					.replace(/\$AMOUNT/g, `${payment.amount}`)
					.replace(/\$NAME/g, student.FamilyID || student.Name)

			// console.log("MESSAGE DATA", message)
			if(this.props.settings.sendSMSOption !== "SIM") {
				alert("can only send messages from local SIM");
			} else {
				const url = smsIntentLink({ messages: [{ text: message, number: student.Phone }], return_link: window.location.href })
				
				const historyObj = {
					faculty: this.props.faculty_id,
					date: new Date().getTime(),
					type: "FEE",
					count: 1,
				}

				this.props.logSms(historyObj)
				//this.props.history.push(url);
				window.location.href = url;
			}
		}

		this.props.addPayment(student, id, payment.amount, payment.date, payment.type, payment.fee_id)

		this.setState({
			payment: {
				...this.state.payment,
				active: false
			}
		})
	}

	componentDidMount() {
		
		const famId = this.familyID()
		// loop through fees, check if we have added
		if(famId === undefined || famId === "") {
			const owedPayments = checkStudentDuesReturning(this.student());
			if (owedPayments.length > 0) {
				this.props.addMultiplePayments(owedPayments);
			}
		} else {
			const siblings = this.siblings()
			this.generateSiblingsPayments(siblings)
		}
	}

	generateSiblingsPayments = (siblings: MISStudent[]) => {
		
		if (siblings.length > 0) {
			const sibling_payments = siblings
				.reduce((agg, curr) => {
					const curr_student_payments = checkStudentDuesReturning(curr)
					if (curr_student_payments.length > 0) {
						return [
							...agg,
							...curr_student_payments
						]
					}
					return agg
				}, [])

			if(sibling_payments.length > 0) {
				this.props.addMultiplePayments(sibling_payments)	
			}			
		}
	}

	componentWillReceiveProps(nextProps: propTypes) {
		// This will make we get the lates changes
		const id = nextProps.match.params.id
		const student = nextProps.students[id]
		const famId = nextProps.match.params.famId || student.FamilyID

		let siblings: MISStudent[]
		let payments

		// generating payments from fees if any
		if(famId === undefined || famId === "") {
			const owedPayments = checkStudentDuesReturning(student);
			if (owedPayments.length > 0) {
				this.props.addMultiplePayments(owedPayments);
			}
		} else {
			siblings = Object.values(nextProps.students)
				.filter(s => s && s.Name && s.FamilyID && s.FamilyID === famId)
			
			this.generateSiblingsPayments(siblings)
		}

		// getting payments if against any single student or siblings
		if(famId === undefined || famId === "") {
			payments = Object.entries(student.payments)
				.reduce((agg, [pid, curr]) => ({
					...agg,
					[pid]: {
						...curr,
						student_id: student.id,
						edited: false
					}
				}), {} as AugmentedMISPaymentMap)

		} else {
			payments = siblings.reduce((agg, curr) => ({
				...agg,
				...Object.entries(curr.payments).reduce((agg, [pid, payment]) => ({
						...agg,
						[pid]: {
							...payment,
							student_id: curr.id,
							edited: false
						}
					}), {} as AugmentedMISPaymentMap)
			}), {})
		}

		const current_month = moment().format("MM/YYYY")
		const edits = Object.entries(payments)
			.filter(([id, payment]) => moment(payment.date).format("MM/YYYY") === current_month && payment.type !== "SUBMITTED")
			.reduce((agg, [id, payment]) => {
				return {
					...agg,
					[id]: {
						...payment,
						student_id: payment.student_id,
						edited: false
					}
				}
			}, {} as AugmentedMISPaymentMap)

			this.setState({
				edits
			})
	}

	onSave = () => {

		const modified_payments = this.state.edits
		let edit_flag = false

		const next_edits = Object.entries(modified_payments)
			.reduce((agg, [payment_id, payment]) => {
				if(payment.edited) {

					const { fee_id, amount } = payment
					const parsed_amount = parseFloat(amount.toString())
					// check if the user added empty amount while editing current month payments
					if(isNaN(parsed_amount))
					{
						edit_flag = true
						return agg
					}

					return {
						...agg,
						[payment_id]: {
							...payment,
							amount: parsed_amount,
							fee_id,
							student_id: payment.student_id
						}
					}
				}

				return agg

			}, {} as AugmentedMISPaymentMap)
		
		if(edit_flag) {
			alert("Please enter valid input")
			return
		}

		this.setState({
			banner: {
				active: true,
				good: true,
				text: "Saved!"
			}
		})

		this.props.editPayment(next_edits)
			
		setTimeout(() => {
			this.setState({
				banner: {
					...this.state.banner,
					active: false
				}
			})
		}, 1000);

	}

	getOwedAmountStyle = (owed_amount: number): string => {
		const style_class = owed_amount <= 0 ? "advance-amount" : "pending-amount"
		return style_class
	}

	// return a route for fee voucher preview
	getPreviewRoute = (): string => {
		const famId = this.familyID()
		const redirectTo = famId === undefined || famId === "" ? `/student/${this.props.match.params.id}` : `/families/${famId}`

		return `${redirectTo}/fee-print-preview?month=${this.state.month}&year=${this.state.year}`
	}

	render() {

		const merged_payments = this.mergedPayments()
		const famId = this.familyID()
		const Months =  new Set(
			Object.entries(merged_payments)
				.sort(([, a_payment], [, b_payment]) => a_payment.date - b_payment.date)
				.map(([id, payment]) => moment(payment.date).format("MMMM"))
			)
		const Years = [...new Set(
			Object.entries(merged_payments)
				.sort(([,a_payment],[,b_payment]) => a_payment.date - b_payment.date)
				.map(([id,payment]) => moment(payment.date).format("YYYY"))
			)]
			
		const filteredPayments = getFilteredPayments(merged_payments, this.state.year, this.state.month)

		const filtered_owed = filteredPayments.reduce((agg, [,curr]) => agg - (curr.type === "SUBMITTED" || curr.type === "FORGIVEN" ? 1 : -1) * curr.amount, 0)
		
		const total_owed = Object.entries(merged_payments)
			.reduce((agg, [, curr]) => agg - (curr.type === "SUBMITTED" || curr.type === "FORGIVEN" ? 1 : -1) * curr.amount, 0)

		const RenderBody = <div className="student-fees">
			{ this.state.banner.active ? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false }
			<PrintHeader settings={this.props.settings} logo={this.props.schoolLogo}/>
			<div className="divider">Payments Information</div>
			<div className="table row">
				<label>Total Monthly Fees:</label>
				<div>Rs. {Object.values(this.getFees()).reduce((agg, curr) => curr.type === "FEE" && curr.period === "MONTHLY" ? agg + parseFloat(curr.amount) : agg, 0)}</div>
			</div>

			<div className="table row">
				<label>Total One-Time Fees:</label>
				<div>Rs. {
					Object.values(this.getFees())
						.reduce((agg, curr) => curr.type === "FEE" && curr.period === "SINGLE" ? agg + parseFloat(curr.amount) : agg, 0)
				}</div>
			</div>
			<div className="divider">{famId === undefined || famId === "" ? "Student Ledger" : "Family Ledger"}</div>

			<div className="filter row no-print"  style={{marginBottom:"10px"}}>
				<select className="" {...this.Former.super_handle(["month"])} style={{ width: "150px" }}>
				
				<option value="">Select Month</option>
				{
					sortYearMonths(Months).map(Month => {
						return <option key={Month} value={Month}>{Month}</option>	
					})
				}
				</select>
				
				<select className="" {...this.Former.super_handle(["year"])}>
				
				<option value="">Select Year</option>
				{ 
					Years.map(year => {
						return <option key={year} value={year}> {year} </option>
					})
				}
				</select>
			</div>

			<div className="payment-history section">
				<div className="table row heading">
					<label><b>Date</b></label>
					<label><b>Label</b></label>
					<label><b>Amount</b></label>
				</div>
					{filteredPayments
						.map(([id, payment]) => {
							return <div className="payment" key={id}>
								<div className="table row">
									<div>{moment(payment.date).format("DD/MM")}</div>
									<div>{getFeeLabel(payment)}</div>
									
									{ this.state.edits[id] !== undefined ? 
										<div className="row" style={{color:"rgb(94, 205, 185)"}}>
											<input style={{textAlign:"right", border: "none"}} type="number" {...this.Former.super_handle(["edits", id, "amount"], () => true, this.paymentEditTracker(id))} />
											<span className="no-print" style={{ width:"min-content" }}>*</span>
										</div>
									: <div> {numberWithCommas(payment.amount)}</div>}
								</div>
							</div> })
				}
				{
					this.state.month !== "" && <div className={`table row last ${this.getOwedAmountStyle(filtered_owed)}`}>
						<label>{filtered_owed <= 0 ? "Current Month Advance:" : "Current Month Pending:"}</label>
						<div>Rs. {numberWithCommas(Math.abs(filtered_owed))}</div>
					</div>
				}
				<div className={`table row last ${this.getOwedAmountStyle(total_owed)}`}>
					<label>{total_owed <= 0 ? "Total Advance:" : "Total Pending:"}</label>
					<div>Rs. {numberWithCommas(Math.abs(total_owed))}</div>	
				</div>
			</div>
			<div className="form">
			<div className="button save" onClick={this.onSave}>Save</div>
				<div className={`button ${this.state.payment.active ? "orange" : "green"}`} onClick={this.newPayment} style={{marginTop:"10px"}}>{this.state.payment.active ? "Cancel" : "New Entry"}</div>

				{ this.state.payment.active && <div className="new-payment">
					<div className="row">
						<label>Amount</label>
						<input type="number" {...this.Former.super_handle(["payment", "amount"])} placeholder="Enter Amount" />
					</div>
					<div className="row">
						<label>Type</label>
						<select {...this.Former.super_handle(["payment", "type"])}>
							<option value="SUBMITTED">Paid</option>
							<option value="FORGIVEN">Need Scholarship</option>
						</select>
					</div>
					<div className="table row">
						<label>Send SMS</label>
						<select {...this.Former.super_handle(["payment", "sendSMS"])}>
							<option value={"false"}>No SMS Notification</option>
							<option value={"true"}>Send SMS Notification</option>
						</select>
					</div>
					<div className="button save" onClick={this.addPayment}>Add Payment</div>
				</div> }
				<Link className="print button" to={this.getPreviewRoute()}> Print Preview</Link>
			</div>

		</div>

		if(famId === undefined || famId === "" || this.props.match.params.id !== undefined) {
			return RenderBody
		}
		// if family payment ledger
		return <Layout history={this.props.history}> 
			<div>{ RenderBody }</div>
		</Layout>
	}
}

export default connect((state: RootReducerState) => ({
	faculty_id: state.auth.faculty_id,
	students: state.db.students,
	connected: state.connected,
	settings: state.db.settings,
	feeSMSTemplate: (state.db.sms_templates || {} as RootDBState["sms_templates"]).fee || "",
	schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : "" 
}), (dispatch: Function) => ({
	addPayment: (student: MISStudent, id: string, amount: number, date: number, type: MISStudentPayment["type"], fee_id: string, fee_name: string) => dispatch(addPayment(student, id, amount, date, type, fee_id, fee_name)),
	addMultiplePayments: (payments: payment[]) => dispatch(addMultiplePayments(payments)),
	sendSMS: (text: string, number: string) => dispatch(sendSMS(text, number)),
	logSms: (history: any) => dispatch(logSms(history)),
	editPayment: (payments: AugmentedMISPaymentMap) => dispatch(editPayment(payments)),
}))(withRouter(StudentFees))