import React, { Component } from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router';
import { v4 } from 'node-uuid'
import moment from 'moment'
import Banner from '../../components/Banner'
import Layout from '../../components/Layout'
import former from "../../utils/former"
import getSectionsFromClasses from '../../utils/getSectionsFromClasses'
import { addMultipleFees, addFee, deleteMultipleFees } from '../../actions'
interface  P {
	students: RootDBState["students"]
    classes: RootDBState["classes"]   

    addMultipleFees: (fees: FeeAddItem[]) => any,
	addFee: (fee: FeeSingleItem) => any,
    deleteMultipleFees: (students_fees: FeeDeleteMap) => any,
}

interface S {
	banner: {
		active: boolean
		good?: boolean
		text?: string
    }
	fee : MISStudentFee
	selected_section_id: string
	selected_student_id: string
	fee_filter: string
}

interface FeeDeleteMap {
	[id: string]: {
		student_id: string
		paymentIds: string[]
	}
}

type FeeAddItem = MISStudentFee & {
	student: MISStudent 
	fee_id: string
}

type FeeSingleItem = MISStudentFee & {
    student_id: string
    fee_id: string
}

type ReducedFeeMap = { 
	[id:string]: {
		count: number
		students_fees: FeeDeleteMap 
	}
}

type propTypes = RouteComponentProps & P

class ManageFees extends Component <propTypes,S> {
    
    former: former
	constructor(props: propTypes) {
		super(props);

		this.state = {
			banner: {
				active: false,
				good: true,
				text: "Saved!"
			},
			fee_filter: "to_all_students",
			selected_section_id: "",
			selected_student_id: "",
			fee: {
				name: "",
				type: "",
				amount: "",
				period: ""
			}
		}

		this.former = new former(this, [])
	}

	delete = (students_fees: FeeDeleteMap) => {

		const effected_students = Object.values(students_fees).length // no. of fees == no. of effected students

		if(window.confirm(effected_students + " students records will be effected! Are you sure you want to Delete Added Fees?")){
			
			// deleting multiple fees and generated payments
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

		if (this.state.fee.name === "" ||
			this.state.fee.amount === "" ||
			this.state.fee.period === "" ||
			this.state.fee.type === ""
			){
				setTimeout(() => this.setState({ banner: { active: false } }), 3000);
				return this.setState({
					banner:
					{
						active: true,
						good:false,
						text: "Please Fill All of the Information"
					}
				})
			}
		
		if(this.state.fee_filter === "to_single_student" && this.state.selected_student_id !=="") {
		
			const student_fee = {
				student_id: this.state.selected_student_id,
				fee_id: v4(),
				...this.state.fee
			}

			// add fee
			this.props.addFee(student_fee)
			
			this.setState({
				banner: {
					active: true,
					good: true,
					text: "Saved!"
				}
			})
		}
		
		if(this.state.fee_filter === "to_all_students" || (this.state.fee_filter === "to_single_class" && this.state.selected_section_id !== "")) {
		
			const fees = Object.values(students)
				.filter( s => s.Name && s.Active && this.state.selected_section_id === "" ? true : s.section_id === this.state.selected_section_id)
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
			
			const temp = this.state.fee_filter === "to_all_students" ? 'All' : 'Class';
			const effected_students = Object.values(fees).length  // no. of fees == no. of effected students
			const alert_message = `${effected_students} Students Records will be effected! Are you sure you want to add fee to whole ${temp} Students?`

			if (window.confirm(alert_message)) {

				// adding multiple fees
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

		else {
			this.setState({
				banner: {
					active: true,
					good: false,
					text: "Please select Class to Add Fee"
				}
			})
		}

		setTimeout(() => this.setState({ banner: { active: false } }), 3000);
	}

	getSelectedSectionStudents = ()  => {
		return	Object.values(this.props.students)
					.filter(  s => s.Name && s.Active && s.section_id === this.state.selected_section_id)
					.sort( (a, b) => a.Name.localeCompare(b.Name))
	}

	render() {
		
		const { classes } = this.props;
		const sortedSections = getSectionsFromClasses(classes).sort((a, b) => ( a.classYear || 0 ) - ( b.classYear || 0 ));

		const fee_undo_students =  this.state.fee_filter === "to_all_students" ? 
										Object.values(this.props.students): 
										this.getSelectedSectionStudents();

		const reduced_fees = fee_undo_students
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
							)
							.map(([pid, ]) => pid)

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

			}, {} as ReducedFeeMap )
		
		return <Layout history={this.props.history}>
			<div className="form sms-page">

				{this.state.banner.active ? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false}

				<div className="title">Fee Management</div>
				<div className="form">
					<div className="divider">Add Fees</div>
					<div className="section">
						<div className="row">
							<label>Add To</label>
							<select {...this.former.super_handle(["fee_filter"])}>
								<option value="">Select Students</option>
								<option value="to_all_students">All Students</option>
								<option value="to_single_class">Single Class</option>
								<option value="to_single_student">Single Student</option>
							</select>
						</div>

						{this.state.fee_filter === "to_single_class" || this.state.fee_filter === "to_single_student" ?  //Section Wise
                        <div className="row"> 
							<label>Select Class</label>		
							<select {...this.former.super_handle(["selected_section_id"])}>
								<option value="" >Select Class</option>
								{
									sortedSections.map( s => <option key={s.id} value={s.id}>{s.namespaced_name}</option>)
								}
							</select>
						</div> : false}
						{this.state.fee_filter === "to_single_student" && this.state.selected_section_id !== "" ?
						<div className = "row">
							<label>Select Student</label>
							<select {...this.former.super_handle(["selected_student_id"])}>
								<option value = "">Select Student</option>
								{
									this.getSelectedSectionStudents().map(s => <option key={s.id} value={s.id}>{s.Name}</option>)
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
				{ Object.entries(reduced_fees)
					.filter(([k, val]) => {
						if(this.state.fee_filter === "to_all_students") {
							// get size of all students
							const total_students = Object.values(this.props.students).length
							return val.count > .9 * total_students;
						}
						else if(this.state.fee_filter === "to_single_class" && this.state.selected_section_id !== "") {
							// get size of class with section_id this.state.selected_section_id
							const size_of_class = Object.values(this.props.students).filter( s => s.section_id === this.state.selected_section_id).length;
							return val.count > .9 * size_of_class
						}
					})
					.sort(([a, ], [b, ]) => a.localeCompare(b))
					.map(([key, val]) => 
						<div className="row" key={key}>
							<label>{ key }</label>
							<div className="button red" style={{ padding : "5px 2px" }} onClick={ () => this.delete (val.students_fees) }>Delete</div>
						</div>
					)
				}
				</div>

			</div>
		</Layout>
	}
}

export default connect(( state: RootReducerState) => ({
	students: state.db.students,
    classes: state.db.classes,
}), (dispatch: Function) => ({
	addMultipleFees: (fees: FeeAddItem[]) => dispatch(addMultipleFees(fees)),
	addFee: (fee: FeeSingleItem) => dispatch(addFee(fee)),
	deleteMultipleFees: (students_fees: FeeDeleteMap) => dispatch(deleteMultipleFees(students_fees))
}))(ManageFees);