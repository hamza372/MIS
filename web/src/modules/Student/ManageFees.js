import React, { Component } from 'react'
import { connect } from 'react-redux'
import { v4 } from 'node-uuid'
import moment from 'moment'

import { getSectionsFromClasses } from 'utils/getSectionsFromClasses';

import { addMultipleFees, deleteMultipleFees } from 'actions'

import former from 'utils/former'
import Layout from 'components/Layout'
import Banner from 'components/Banner'


class ManageFees extends Component {

	constructor(props) {
		super(props);

		this.state = {
			banner: {
				active: false,
				good: true,
				text: "Saved!"
			},
			feeFilter: "to_all_students",
			section_id: "",
			fee: {
				name: "",
				type: "",
				amount: "",
				period: ""
			}
		}

		this.former = new former(this, [])
	}

	delete = (students_fees) => {

		const effect_count = Object.values(students_fees).length

		if(window.confirm(effect_count+" student records will be effected! Are you sure you want to Delete Added Fees?")){

			setTimeout(() => this.setState({ banner: { active: false } }), 3000);
			
			this.props.deleteMultipleFees(students_fees)

			this.setState({
				banner: {
					active: true,
					good: true,
					text: "Bulk fees removed successfully"
				}
			})	
		
		}
	}
	save = () => {

		const { students } = this.props;

		setTimeout(() => this.setState({ banner: { active: false } }), 4000);

		if (this.state.fee.name === "" ||
			this.state.fee.amount === "" ||
			this.state.fee.period === "" ||
			this.state.fee.type === ""
		) {
			return this.setState({
				banner:
				{
					active: true,
					good: false,
					text: "Please fill all the required fields"
				}
			})
		}

		const fees = Object.values(students)
			.filter(s => s.Active && this.state.section_id === "" ? true : s.section_id === this.state.section_id)
			.map(student => {
				const fee_id = v4()
				const { name, amount, type, period } = this.state.fee
				return {
					student,
					fee_id,
					name,
					amount,
					type,
					period
				}
			})

		if (fees === undefined) {
			return this.setState({
				banner:
				{
					active: true,
					good: false,
					text: "There are no students for this Class"
				}
			})
		}
		
		const temp = this.state.feeFilter === "to_all_students" ? 'All' : 'Class';
		const effect_count = Object.values(fees).length
		const alert_message = `${effect_count} student records will be effected! Are you sure you want to add fee to whole ${temp} Students?`
		
		if (window.confirm(alert_message)) {

			this.props.addMultipleFees(fees)

			this.setState({
				banner: {
					active: true,
					good: true,
					text: "Saved!"
				}
			})
		}

	}

	filterCallBack = () => this.state.feeFilter === "to_all_students" ? this.setState({ section_id: "" }) : true

	render() {
		
		const { classes } = this.props;
		const sortedSections = getSectionsFromClasses(classes).sort((a, b) => (a.classYear || 0) - (b.classYear || 0));

		const reduced_fees = Object.values(this.props.students)
			.filter(x => x.Name && x.fees && x.payments)
			.reduce((agg, curr) => {
				
				const fees = curr.fees;
				const curr_payments = curr.payments
		
				Object.entries(fees)
					.forEach(([fee_id, fee]) => {

						// if the fee id is empty string, just return
						if(fee_id === "") return;

						const fee_key = `${fee.name}-${fee.period}-${fee.type}-${fee.amount}`
						const curr_date = moment().format("MM/YYYY")

						const paymentIds = Object.entries(curr_payments)
							.filter(([payment_id, payment]) => payment && 
								payment.type === "OWED" &&
								moment(payment.date).format("MM/YYYY") === curr_date &&
								payment.fee_id === fee_id
							).map(([pid, ]) => pid)

						if(agg[fee_key]) {
							agg[fee_key] = {
								count: agg[fee_key].count + 1,
								students_fees: {
									...agg[fee_key].students_fees,
									[fee_id]: {
										student_id: curr.id,
										paymentIds: paymentIds
									}
								}
							}
						} else {
							agg[fee_key] = {
								count: 1,
								students_fees: {
									[fee_id]: {
										student_id: curr.id,
										paymentIds: paymentIds
									}
								}
							}
						}
					})

				return agg;

			}, {})
		
		// sorting fees by value
		const fee_counts = Object.keys(reduced_fees).sort().reduce((agg, curr) => (agg[curr] = reduced_fees[curr], agg), {})
		
		return <Layout history={this.props.history}>
			<div className="form sms-page">

				{this.state.banner.active ? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false}

				<div className="title">Fee Management</div>
				<div className="form">

					<div className="divider">Add Fees</div>
					<div className="section">
						<div className="row">
							<label>Add To</label>
							<select {...this.former.super_handle(["feeFilter"], () => true, this.filterCallBack)}>
								<option value="">Select Students</option>
								<option value="to_all_students">All Students</option>
								<option value="to_single_class">Single Class</option>
							</select>
						</div>

						{this.state.feeFilter === "to_single_class" ?  //Section Wise
                        <div className="row"> 
							<label>Select Class</label>		
							<select {...this.former.super_handle(["section_id"])}>
								<option value="" >Select Class</option>
								{
									sortedSections.map( s => <option key={s.id} value={s.id}>{s.namespaced_name}</option>)
								}
							</select>
						</div> : false}
					</div>
					<div className="section">
						<div className="row">
							<label>Fee Type</label>
							<select {...this.former.super_handle(["fee", "type"])}>
								<option value="">Select Fee Type</option>
								<option value="FEE">Fee</option>
								<option value="SCHOLARSHIP">Scholarship</option>
							</select>
						</div>
						<div className="row">
							<label>Name</label>
							<input type="text" {...this.former.super_handle(["fee", "name"])} placeholder="Enter Name" />
						</div>
						<div className="row">
							<label>Amount</label>
							<input type="text" {...this.former.super_handle(["fee", "amount"])} placeholder="Enter Amount" />
						</div>
						<div className="row">
							<label>Fee Period</label>
							<select {...this.former.super_handle(["fee", "period"])}>
								<option value="">Select Period</option>
								<option value="MONTHLY">Monthly</option>
								<option value="SINGLE">One Time</option>
							</select>
						</div>
						<div className="button blue" onClick={this.save}> Add </div>
					</div>
				</div>

				<div className="divider">Recent Added Fees</div>
				<div className="section form">
				{ Object.entries(fee_counts)
					.filter(([k, val]) => {
						if(this.state.feeFilter === "to_all_students") {
							// get size of all students
							const total_students = Object.values(this.props.students).length
							return val.count > .9 * total_students;
						}
						else if(this.state.feeFilter === "to_single_class" && this.state.section_id !== "") {
							// get size of class with section_id this.state.section_id
							const size_of_class = Object.values(this.props.students).filter( s => s.section_id === this.state.section_id).length;
							return val > .9 * size_of_class
						}
					})
					.map(([key, val]) => 
						<div className="row" key={key}>
							<label>{ key }</label>
							<div className="button red" style={{ padding : "5px 2px" }} onClick={ () => this.delete (val.students_fees) }>Delete</div>
						</div>
				)}
				</div>

			</div>
		</Layout>
	}
}

export default connect(state => ({
	students: state.db.students,
	classes: state.db.classes,
}), dispatch => ({
	addMultipleFees: (fees) => dispatch(addMultipleFees(fees)),
	deleteMultipleFees: (students_fees) => dispatch(deleteMultipleFees(students_fees))
}))(ManageFees);