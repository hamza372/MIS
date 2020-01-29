import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router';
import Former from 'utils/former';
import { connect } from 'react-redux';
import checkCompulsoryFields from 'utils/checkCompulsoryFields'
import numberWithCommas from 'utils/numberWithCommas';
import { addExpense, addSalaryExpense, deleteExpense, editExpense } from 'actions';
import moment from 'moment';
import Banner from 'components/Banner';
import chunkify from 'utils/chunkify';
import { GeneralExpensePrintableList } from 'components/Printable/Expense/General/list';

import '../style.css';

interface P {
	teachers: RootDBState["faculty"];
	expenses: RootDBState["expenses"];
	settings: RootDBState["settings"];
	schoolLogo: RootDBState["assets"]["schoolLogo"];
	addExpense: (amount: number, label: string, type: MISExpense["type"], category: MISExpense["category"], quantity: number, date: number) => any;
	addSalaryExpense: (id: string, amount: number, label: string, type: MISSalaryExpense["type"], faculty_id: string, date: number, advance: number, deduction: number, deduction_reason: string) => any;
	editExpense: (edits: { [id: string]: { amount: number } }) => any;
	deleteExpense: (deletes: string) => any;
}
/**
 * need to do something to show expense deduction 
 * 
 * might use this 
  (curr.expense === "SALARY_EXPENSE" && curr.deduction || 0)
 */

interface S {
	banner: {
		active: boolean;
		good: boolean;
		text: string;
	};
	payment: {
		active: boolean;
		amount: string;
		type: string;
		category: MISExpense["category"];
		faculty_id: string;
		quantity: string;
		label: string;
		deduction: string;
		deduction_reason: string;
		date: number;
	};
	monthFilter: string;
	yearFilter: string;
	categoryFilter: string;
	edits: {
		[id: string]: { amount: number };
	};
}

interface Routeinfo {
	id: string;
}

type propTypes = RouteComponentProps<Routeinfo> & P

class Expenses extends Component<propTypes, S> {

	former: Former
	constructor(props: propTypes) {
		super(props)

		const current_month = moment().format("MM-YYYY")
		const edits = Object.entries(props.expenses)
			.filter(([id, e]) => moment(e.time).format("MM-YYYY") === current_month && e.type === "PAYMENT_GIVEN")
			.reduce((agg, [id, curr]) => {
				return {
					...agg,
					[id]: {
						amount: curr.amount
					}
				}
			}, {} as { [id: string]: { amount: number } })

		this.state = {
			banner: {
				active: false,
				good: true,
				text: "Saved!"
			},
			payment: {
				active: false,
				amount: "",
				label: "",
				type: "PAYMENT_GIVEN",
				category: "",
				faculty_id: "",
				quantity: "1",
				deduction: "0",
				deduction_reason: "",
				date: moment.now()
			},
			monthFilter: "",
			yearFilter: "",
			categoryFilter: "",
			edits,
		}
		this.former = new Former(this, [])
	}

	componentDidMount() {
		/*  
			//In case we change it to automatic
		 console.log("LOADED Expenses")

		Object.values(this.props.teachers)
			.filter(t => t.Salary !== "")  
			.forEach(t => {
				const id = `${moment().format("MM-YYYY")}-${t.id}`
				if(!this.props.expenses[id])
				{
					//id, amount, label, type, category, faculty_id
					this.props.addSalaryExpense( id, parseFloat(t.Salary), this.props.teachers[t.id].Name, "PAYMENT_DUE", "SALARY", t.id )
					console.log("<================================>\n")
				} 
			}) */
	}

	componentWillReceiveProps(newProps: propTypes) {
		//Making sure to get latest changes

		const current_month = moment().format("MM-YYYY")
		const edits = Object.entries(newProps.expenses)
			.filter(([id, e]) => moment(e.time).format("MM-YYYY") === current_month && e.type === "PAYMENT_GIVEN")
			.reduce((agg, [id, curr]) => {
				return {
					...agg,
					[id]: {
						amount: curr.amount
					}
				}
			}, {} as { [id: string]: { amount: number } })

		this.setState({
			edits
		})

	}

	newPayment = () => {
		this.setState({
			payment: {
				...this.state.payment,
				active: !this.state.payment.active,
				amount: "",
				label: "",
				type: "PAYMENT_GIVEN",
				category: "",
				faculty_id: "",
				quantity: "1",
				deduction: "0",
				deduction_reason: "",
				date: moment.now()
			}
		})
	}

	addPayment = () => {
		const payment = this.state.payment
		const id = `${moment().format("MM-YYYY")}-${payment.faculty_id}`

		let compulsoryFields
		if (this.state.payment.category && this.state.payment.category === "SALARY") {
			compulsoryFields = checkCompulsoryFields(this.state.payment, [
				["amount"], ["type"], ["faculty_id"],
			])
		}
		else if (this.state.payment.category) {
			compulsoryFields = checkCompulsoryFields(this.state.payment, [
				["amount"], ["label"], ["type"], ["quantity"]
			])
		}
		else {
			compulsoryFields = checkCompulsoryFields(this.state.payment, [
				["category"]
			])
		}

		if (compulsoryFields) {
			const erroText = `Please Fill ${(compulsoryFields as string[][]).map(x => x[0] === "faculty_id" ? "Teacher" : x[0]).join(", ")} !`

			return this.setState({
				banner: {
					active: true,
					good: false,
					text: erroText
				}
			})
		}

		if (payment.category === "SALARY") {

			this.props.addSalaryExpense(id, parseFloat(payment.amount) || 0, this.props.teachers[payment.faculty_id].Name, "PAYMENT_GIVEN", payment.faculty_id, payment.date, 0, Math.abs(parseFloat(payment.deduction) || 0), payment.deduction_reason)

			this.setState({
				banner: {
					active: true,
					good: true,
					text: "Saved"
				}
			})

			setTimeout(() => {
				this.setState({
					banner: {
						...this.state.banner,
						active: false
					}
				})
			}, 1000)

			this.newPayment()
			return
		}

		this.props.addExpense(parseFloat(payment.amount), payment.label, "PAYMENT_GIVEN", payment.category, parseFloat(payment.quantity), payment.date)

		this.setState({
			banner: {
				active: true,
				good: true,
				text: "Saved"
			}
		})

		setTimeout(() => {
			this.setState({
				banner: {
					...this.state.banner,
					active: false
				}
			})
		}, 1000)

		this.newPayment()
	}

	onSave = () => {

		const filtered_edits = Object.entries(this.state.edits)
			.filter(([id, exp]) => this.props.expenses[id].amount !== exp.amount)
			.reduce((agg, [id, curr]) => {
				return {
					...agg,
					[id]: {
						amount: curr.amount
					}
				}
			}, {})

		this.props.editExpense(filtered_edits)

		this.setState({
			banner: {
				active: true,
				good: true,
				text: "Saved!"
			}
		})

		setTimeout(() => {
			this.setState({
				banner: {
					...this.state.banner,
					active: false
				}
			})
		}, 1000)
	}

	onDelete = (id: string) => {
		if (!window.confirm("Are you sure you want to Delete this entry permanently?")) {
			return
		}
		this.props.deleteExpense(id)

		this.setState({
			banner: {
				active: true,
				good: false,
				text: "Deleted!"
			}
		})

		setTimeout(() => {
			this.setState({
				banner: {
					...this.state.banner,
					active: false
				}
			})
		}, 1000)
	}
	getFilterCondition = (year: string, month: string, payment: any) => {
		//when both are empty
		if (month === "" && year === "") {
			return true
		}
		//when month is empty	
		if (month === "" && year !== "") {
			return moment(payment.date).format("YYYY") === year;
		}
		//when year is empty
		if (month !== "" && year === "") {
			return moment(payment.date).format("MMMM") === month
		}
		//when both are not empty
		if (month !== "" && year !== "") {
			return moment(payment.date).format("MMMM") === month && moment(payment.date).format("YYYY") === year;
		}
	}

	onTeacherSelect = (e: { target: { value: any } }) => {
		if (this.props.teachers[e.target.value]) {
			this.setState({
				payment: {
					...this.state.payment,
					faculty_id: e.target.value,
					amount: this.props.teachers[e.target.value].Salary || "0"
				}
			})
		}
	}

	render() {

		const { expenses, teachers, settings } = this.props

		const chunkSize = 22 // records per table

		let Months  = new Set([])
		let Years = new Set([])

		for (const e of Object.values(expenses)) {
			Months.add(moment(e.date).format("MMMM"))
			Years.add(moment(e.date).format("YYYY"))
		}

		let total_filtered_expense = 0

		const total_expense = Object.values(expenses)
			.reduce((agg, curr) => {
				if (curr.type === "PAYMENT_GIVEN") {
					if (this.getFilterCondition(this.state.yearFilter, this.state.monthFilter, curr) && (this.state.categoryFilter !== "" ? this.state.categoryFilter === curr.category : true)) {
						total_filtered_expense += curr.amount - ((curr.expense === "SALARY_EXPENSE" && curr.deduction) || 0)
					}
					return agg + (curr.amount - ((curr.expense === "SALARY_EXPENSE" && curr.deduction) || 0))
				}
				else
					return agg
			}, 0)

		const filtered_expenses = Object.entries(expenses)
			.filter(([id, e]) => this.getFilterCondition(this.state.yearFilter, this.state.monthFilter, e) && 
				(this.state.categoryFilter !== "" ? this.state.categoryFilter === e.category: true) &&
				e.type !== 'PAYMENT_DUE')
			.sort(([,a],[,b]) => a.date - b.date)

		return <div className="expenses">

			{this.state.banner.active ? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false}

			<div className="divider no-print">Expense Information</div>

			<div className="table row no-print">
				<label>Total Expense:</label>
				<div>Rs. {numberWithCommas(total_expense)}</div>
			</div>

			<div className="divider no-print">Ledger</div>

			<div className="filter row no-print" style={{ marginBottom: "10px", flexWrap: "wrap" }}>
				<select {...this.former.super_handle(["monthFilter"])}>
					<option value="">Select Month</option>
					{
						[...Months].map(Month => {
							return <option key={Month} value={Month}>{Month}</option>
						})
					}
				</select>

				<select {...this.former.super_handle(["yearFilter"])}>
					<option value="">Select Year</option>
					{
						[...Years].map(year => {
							return <option key={year} value={year}> {year} </option>
						})
					}
				</select>

				<select {...this.former.super_handle(["categoryFilter"])}>
					<option value="">Select Category</option>
					<option value="SALARY">Salary</option>
					<option value="BILLS">Utility Bills</option>
					<option value="STATIONERY">Stationery</option>
					<option value="REPAIRS">Repairs</option>
					<option value="RENT">Rent</option>
					<option value="ACTIVITY">Student Activity</option>
					<option value="DAILY">Daily</option>
					<option value="PETTY_CASH">Petty Cash</option>
				</select>
			</div>

			<div className="payment-history no-print section">
				<div className="table row heading">
					<label><b> Date   </b></label>
					<label><b> Label  </b></label>
					<label><b> Category </b></label>
					<label><b> Quantity</b></label>
					<label><b> Deductions(Rs) </b></label>
					<label><b> Amount </b></label>
				</div>
				{
					filtered_expenses
					.map(([id, e]) => {
						if(e.expense === "SALARY_EXPENSE")
						{
							return <div key={id} className={ e.type === "PAYMENT_DUE" ? "table row no-print" : "table row"}>
								<label> {moment(e.date).format("DD-MM-YY")} </label>
								<label> {e.label}</label>
								<label> {e.category}</label>
								<label> - </label>
								<label> { e.deduction }{ e.deduction_reason ? `(${e.deduction_reason})` : "" } </label>
								{ this.state.edits[id] !== undefined ? (<div className="row" style={{color: "rgb(94, 205, 185)", justifyContent:"space-between"}}>
									<input style={{ textAlign: "right", border: "none", borderBottom: "1px solid #bbb", width: "70%"}} type="number" {...this.former.super_handle(["edits", id, "amount"])}/>
									<div className="button red" style={{ padding: "0px", textAlign:"center", width: "15px", lineHeight: "15px" }} onClick={() => this.onDelete(id)}>x</div>
								</div>) : (<label> {numberWithCommas(e.amount - e.deduction)}</label>)}
							</div>
						}
						if (e.expense === "MIS_EXPENSE")
						{
							return <div key={id} className="table row">
								<label> {moment(e.date).format("DD-MM-YY")} </label>
								<label> {e.label}</label>
								<label> {e.category}</label>
								<label> {e.quantity} </label>
								<label> {`-`} </label>
								{
									(this.state.edits[id] && <div className="row" style={{ color: "rgb(94, 205, 185)", justifyContent: "space-between" }}>
										<input style={{ textAlign: "right", border: "none", width: "70%" }} type="number" {...this.former.super_handle(["edits", id, "amount"])} />
										<div className="button red" style={{ padding: "0px", textAlign: "center", width: "15px", lineHeight: "15px" }} onClick={() => this.onDelete(id)}>x</div>
									</div>) || <label>{numberWithCommas(e.amount)}</label>
								}
							</div>
						}
						return null
				})
			}
				<div className="table row last">
					<label><b> Total Paid:</b></label>
					<div><b>Rs. {numberWithCommas(total_filtered_expense)}</b></div>
				</div>
			</div>

			<div className="button save" style={{ marginTop: "5px" }} onClick={() => this.onSave()}> Save </div>

			<div className="form no-print">
				<div className={`button ${this.state.payment.active ? "orange" : "green"}`} style={{ marginTop: "10px" }} onClick={this.newPayment}>{this.state.payment.active ? "Cancel" : "New Entry"}</div>

				{this.state.payment.active && <div className="new-payment">
					<div className="row">
						<label>Date</label>
						<input
							type="date"
							value={moment(this.state.payment.date).format("YYYY-MM-DD")}
							onChange={this.former.handle(["payment", "date"])}
						/>
					</div>

					<div className="row">
						<label>Category</label>
						<select {...this.former.super_handle(["payment", "category"])}>
							<option value="">Select</option>
							<option value="SALARY">Salary</option>
							<option value="BILLS">Utility Bills</option>
							<option value="STATIONARY">Stationary</option>
							<option value="REPAIRS">Repairs</option>
							<option value="RENT">Rent</option>
							<option value="ACTIVITY">Student Activity</option>
							<option value="DAILY">Daily</option>
							<option value="PETTY_CASH">Petty Cash</option>
						</select>
					</div>

					{ this.state.payment.category === "SALARY" && <div className="row">
							<label> Teacher </label>
							<select onChange={(e) => this.onTeacherSelect(e)}>
								<option value="">SELECT</option>
								{
									Object.values(teachers)
									.filter( f => f && f.Active && f.Name)
									.sort((a, b) => a.Name.localeCompare(b.Name))
									.map(t => {
										return <option key={t.id} value={t.id}> {t.Name} </option>
									})
								}
							</select>
					</div>
					}

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
					{this.state.payment.category === "SALARY" && <div className="row">
						<label>Deductions</label>
						<input type="number" {...this.former.super_handle(["payment", "deduction"])} placeholder="If any" />
					</div>}
					{this.state.payment.category === "SALARY" && <div className="row">
						<label>Reason</label>
						<input type="text" {...this.former.super_handle(["payment", "deduction_reason"])} placeholder="If any" />
					</div>}
					<div className="button save" onClick={this.addPayment}>Add Payment</div>
				</div>
				}

				<div className="print button" style={{marginTop:"5px"}} onClick={() => window.print()}> Print </div>
			</div>
			{
				chunkify(filtered_expenses, chunkSize)
					.map((itemsChunk: any, index: number) => <GeneralExpensePrintableList key={index}
						items={itemsChunk}
						chunkSize={index === 0 ? 0 : chunkSize * index}
						schoolName={settings.schoolName}/>)
			}
		</div>
		
	}
}

export default connect((state: RootReducerState) => ({
	teachers: state.db.faculty,
	expenses: state.db.expenses,
	settings: state.db.settings,
	schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : ""
}), (dispatch: Function) => ({
	addExpense: (amount: number, label: string, type: MISExpense["type"], category: MISExpense["category"], quantity: number, date: number) => dispatch(addExpense(amount, label, type, category, quantity, date)),
	addSalaryExpense: (id: string, amount: number, label: string, type: MISSalaryExpense["type"], faculty_id: string, date: number, advance: number, deduction: number, deduction_reason: string) => dispatch(addSalaryExpense(id, amount, label, type, faculty_id, date, advance, deduction, deduction_reason)),
	editExpense: (edits: { [id: string]: { amount: number } }) => dispatch(editExpense(edits)),
	deleteExpense: (id: string) => dispatch(deleteExpense(id))
}))(Expenses)
