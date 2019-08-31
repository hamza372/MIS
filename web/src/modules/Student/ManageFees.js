import React, { Component } from 'react'
import { connect } from 'react-redux'
import { v4 } from 'node-uuid'

import {getSectionsFromClasses} from 'utils/getSectionsFromClasses';

import { addMultipleFees } from 'actions'

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

	save = () => {
		
		const { students } = this.props;

		if( this.state.fee.name === "" || 
			this.state.fee.amount	=== "" || 
			this.state.fee.period === "" || 
			this.state.fee.type === ""
			){
				return this.setState({
					banner:
					{
						active: true,
						good:false,
						text: "Please Fill All of the Information "
					}
				})
			}
		
		const fees = Object.values(students)
			.filter( s => s.Active && this.state.section_id === "" ? true : s.section_id === this.state.section_id)
			.map(student => {
				const fee_id = v4()
				const {name, amount, type, period } = this.state.fee
				return {
						student,
						fee_id,
						name,
						amount,
						type,
						period
					}
				})

		if(fees === undefined){
			return this.setState({
				banner:
				{
					active: true,
					good:false,
					text: "There are no students for this Class"
				}
			})
		}

		this.props.addMultipleFees(fees)
		
		this.setState({
			banner: {
				active: true,
				good: true,
				text: "Saved!"
			}
		})

		setTimeout(() => this.setState({ banner: { active: false } }), 3000);
	}

	filterCallBack = () => this.state.feeFilter === "to_all_students" ? this.setState({ section_id: "" }) : true 

	render() {
		
		const { classes } = this.props;
		const sortedSections = getSectionsFromClasses(classes).sort((a, b) => (a.classYear || 0) - (b.classYear || 0));

		return <Layout history={this.props.history}>
			<div className="sms-page">
				{ this.state.banner.active ? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false }

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
								<option value="" >Select</option>
								{
									sortedSections.map( s => <option key={s.id} value={s.id}>{s.namespaced_name}</option>)
								}
							</select>
						</div> : false}
					</div>
					<div className="section">
                        <div className="row"> 
							<label>Fee Type</label>		
							<select {...this.former.super_handle(["fee","type"])}>
								<option value="">Select</option>
								<option value="FEE">Fee</option>
								<option value="SCHOLARSHIP">Scholarship</option>
							</select>
						</div>
                        <div className="row"> 
                            <label>Name</label>		
                            <input type="text" {...this.former.super_handle(["fee","name"])} placeholder="Enter Name"/>
						</div>
                        <div className="row"> 
                            <label>Amount</label>		
                            <input type="text" {...this.former.super_handle(["fee","amount"])} placeholder="Enter Amount"/>
						</div>
                        <div className="row">
                        	<label>Fee Period</label>		
							<select {...this.former.super_handle(["fee","period"])}>
								<option value="">Select</option>
								<option value="MONTHLY">Monthly</option>
								<option value="SINGLE">One Time</option>
							</select>
						</div>
                        <div className="button blue" onClick={this.save}> Add </div>
					</div>
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
}))(ManageFees);