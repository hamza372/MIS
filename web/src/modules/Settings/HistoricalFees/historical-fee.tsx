import React, { Component } from 'react'
import { RouteComponentProps } from 'react-router';
import former from '../../../utils/former';
import { connect } from 'react-redux'
import Layout from '../../../components/Layout';

import './style.css'
import moment from 'moment'
import getSectionsFromClasses from '../../../utils/getSectionsFromClasses';
import { addHistoricalPayment } from '../../../actions';
import { StudentLedgerPage } from '../../Student/Single/Fees/StudentLedgerPage';
import getFilteredPayments from '../../../utils/getFilteredPayments';
import Banner from '../../../components/Banner';

export type historicalPayment = {
	date: number
	name: string
	amount_owed: number
	amount_paid: number
	amount_forgiven: number
}

interface  P {
	students: RootDBState["students"]
	classes: RootDBState["classes"]
	settings: RootDBState["settings"]
	addHistoricalPayment: (payments: historicalPayment, student_id: string) => any
}

interface S {
	banner: {
		active: boolean
		good: boolean
		text: string
	}
	fee : {
		date: number
		name: string
		amount_owed: string
		amount_paid: string
		amount_forgiven: string
	},
	selected_class: string
	selected_student: string
	monthFilter: string
	yearFilter: string
}

interface RouteInfo {

}

type propTypes = RouteComponentProps<RouteInfo> & P

class historicalFee extends Component <propTypes, S > {

	former: former
	constructor(props: propTypes) {
		super(props)
	
		this.state = {
			banner: {
				active: false,
				good: true,
				text: "Saved!"
			},
			fee : {
				date: moment.now(),
				name: "Monthly",
				amount_owed: "0",
				amount_paid: "0",
				amount_forgiven: "0"
			},
			selected_class: "",
			selected_student: "",
			monthFilter: "",
			yearFilter: ""
		}
		this.former = new former(this, [])
	}

	save = () => {
		
		const payment = {
			...this.state.fee,
			amount_owed: parseFloat(this.state.fee.amount_owed) || 0,
			amount_paid: parseFloat(this.state.fee.amount_paid) || 0,
			amount_forgiven: parseFloat(this.state.fee.amount_forgiven) || 0
		}

		this.setState({
			banner: {
				active: true,
				good: true,
				text: "Entry Added!"
			}
		})

		setTimeout(() => {
			this.setState({
				banner: {
					...this.state.banner,
					active: false
				}
			})
		}, 1500);

		this.props.addHistoricalPayment(payment, this.state.selected_student)
	}
	
	render() {

		const { students, classes, settings } = this.props

		const class_Items = getSectionsFromClasses(classes)

		const student_items = Object.values(students)
			.filter(s => s.Name && this.state.selected_class !== "" ? s.section_id === this.state.selected_class : true)
			
		const selected_student = students[this.state.selected_student]
		
		let filteredPayments = selected_student ? getFilteredPayments(selected_student, this.state.yearFilter, this.state.monthFilter) : false
		const curr_class_name = this.state.selected_class ? class_Items.find( s => s.id === this.state.selected_class).namespaced_name : "None Selected"
		
		const Months = new Set()
		const Years = new Set()

		if(selected_student){

			if(this.state.selected_class && selected_student.section_id !== this.state.selected_class){
				this.setState({
					selected_student: ""
				})
			}

			Object.entries(selected_student.payments || {})
				.sort(([, a_payment], [, b_payment]) => a_payment.date - b_payment.date)
				.map(([id, payment]) => { 
					Months.add(moment(payment.date).format("MMMM"))
					Years.add(moment(payment.date).format("YYYY"))
					}
				)
		}

		return <Layout history={this.props.history}>
			<div className="historical-fees form">
			{ this.state.banner.active ? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false }
				<div className="title"> Historical Fee </div>

				<div className="section">
					<div className="row">
						<label> Class</label>
						<select {...this.former.super_handle(["selected_class"])}>
							<option value="">Select Class</option>
							{
								class_Items.map(c => <option value={c.id} key={c.id}>{c.namespaced_name}</option>)
							}
						</select>
					</div>
					<div className="row">
						<label> Student</label>
						<select {...this.former.super_handle(["selected_student"])}>
							<option value="">Select Student</option>
							{
								student_items.map(s => <option key={s.id} value={s.id}>{s.Name}</option>)
							}
						</select>
					</div>
				</div>

				{ this.state.selected_student && <div className="section">
					<div className="row">
						<label> Date </label>
						<input
							type="date"
							value={moment(this.state.fee.date).format("YYYY-MM-DD")}
							onChange={this.former.handle(["fee", "date"])}
						/>
					</div>
					<div className="row">
						<label> Name </label>
						<input type="text" {...this.former.super_handle(["fee", "name"])}/>
					</div>
					<div className="row">
						<label> Amount Owed </label>
						<input type="number" {...this.former.super_handle(["fee", "amount_owed"])}/>
					</div>
					<div className="row">
						<label> Amount Paid </label>
						<input type="number" {...this.former.super_handle(["fee", "amount_paid"])}/>
					</div>
					<div className="row">
						<label> Amount Forgiven </label>
						<input type="number" {...this.former.super_handle(["fee", "amount_forgiven"])}/>
					</div>
					<div className="button blue" onClick={() => this.save()}> Add Fee</div>
				</div>}
				{selected_student && <div className="section">
					<div className="row">
						<select {...this.former.super_handle(["monthFilter"])}>
							<option value=""> Select Month</option>
							{
								Array.from(Months)
									.map(m => <option key={m} value={m}>{m}</option>)
							}
						</select>
						<select {...this.former.super_handle(["yearFilter"])}>
							<option value=""> Year</option>
							{
								Array.from(Years)
									.map(y => <option key={y} value={y}>{y}</option>)
							}
						</select>
					</div>
				</div>}
			</div>
			
			{ filteredPayments && <div style={{width: "80%", margin: "0px auto"}}>
				<StudentLedgerPage 
					payments = {filteredPayments}
					settings = {settings}
					student = {selected_student}
					class_name = {curr_class_name}
				/>
			</div>}

		</Layout>
	}
}

export default connect(( state: RootReducerState ) => ({
	students: state.db.students,
	classes: state.db.classes,
	settings: state.db.settings
}), ( dispatch: Function ) => ({
	addHistoricalPayment: (payment: historicalPayment, student_id: string) => dispatch(addHistoricalPayment(payment, student_id))
}))(historicalFee)