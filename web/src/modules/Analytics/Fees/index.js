import React, {Component} from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import moment from 'moment'

import { checkStudentDuesReturning } from 'utils/checkStudentDues'
import { addMultiplePayments } from 'actions'
import { PrintHeader } from 'components/Layout'
import Former from 'utils/former'

import getSectionsFromClasses from 'utils/getSectionsFromClasses'

import { ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts'

	const MonthlyFeesChart = (props) => {
		const filter = props.filter
		return <ResponsiveContainer width="100%" height={200}>
					<LineChart 
						data={
							Object.entries(props.monthly_payments)
								.sort(([m1,], [m2,]) => moment(m1, "MM/YYYY").diff(moment(m2, "MM/YYYY")))
								.map(([month, { OWED, SUBMITTED, FORGIVEN }]) => ({
									month, OWED, SUBMITTED, FORGIVEN, net: Math.abs(SUBMITTED - OWED) 
								}))}>
						
						<XAxis dataKey="month" />
						<YAxis />
						<Tooltip />
						
						{ filter.total && <Line dataKey='OWED' name="Total" stroke="#74aced" strokeWidth={3} /> }
						{ filter.paid && <Line dataKey="SUBMITTED" stackId="a" stroke="#93d0c5" name="Paid" strokeWidth={3}/> }
						{ filter.forgiven && <Line dataKey="FORGIVEN" stackId="a" stroke="#939292" name="Forgiven" strokeWidth={3}/>}
						{ filter.pending  && <Line dataKey='net' name="Pending" strokeWidth={3} stroke="#ff6b68" />}

					</LineChart>
				</ResponsiveContainer> 
	}
	
	const MonthlyFeesTable = (props) => {
		
		const total = props.total_debts;
		const monthly_payments = props.monthly_payments;
	
		return <div className="section table" style={{margin: "20px 0", backgroundColor:"#c2bbbb21", overflowX: "scroll" }}>
				<div className="table row heading">
					<label style={{ backgroundColor: "#efecec", textAlign:"center" }}> <b> Date     </b></label>
					<label style={{ backgroundColor: "#bedcff", textAlign:"center" }}> <b> Total    </b> </label>
					<label style={{ backgroundColor: "#93d0c5", textAlign:"center" }}> <b> Paid     </b> </label>
					<label style={{ backgroundColor: "#e0e0e0", textAlign:"center" }}> <b> Forgiven </b> </label>
					<label style={{ backgroundColor: "#fc6171", textAlign:"center" }}> <b> Pending  </b> </label>
				</div>
				{
					[...Object.entries(monthly_payments)
						.sort(([m1, ], [m2, ]) => moment(m1, "MM/YYYY").diff(moment(m2, "MM/YYYY")))
						.map(([month, { OWED, SUBMITTED, FORGIVEN, SCHOLARSHIP }]) => {
														
							const prof = SUBMITTED - OWED;
							const red = "#fc6171"
							return <div className="table row" key={month}>
								<div style={{ backgroundColor: "#efecec", textAlign:"center" }}>{month}</div>
								<div style={{ backgroundColor: "#bedcff", textAlign:"center" }}>{numberWithCommas(OWED)}</div>
								<div style={{ backgroundColor: "#93d0c5", textAlign:"center" }}>{numberWithCommas(SUBMITTED)}</div>
								<div style={{ backgroundColor: "#e0e0e0", textAlign:"center" }}>{numberWithCommas(FORGIVEN + SCHOLARSHIP)}</div>
								<div style={{ backgroundColor: red, textAlign:"center" }}>{numberWithCommas(OWED - (SUBMITTED + FORGIVEN + SCHOLARSHIP))}</div>
							</div>
						}),
						<div className="table row footing" style={{borderTop: '1.5px solid #333'}} key={Math.random()}>
						<br/> 
							<label style={{ backgroundColor: "#efecec", textAlign:"center" }}><b>Total</b></label>
							<label style={{ backgroundColor: "#bedcff", textAlign:"center" }}><b>{numberWithCommas(total.OWED)}</b></label>
							<label style={{ backgroundColor: "#93d0c5", textAlign:"center" }}><b>{numberWithCommas(total.PAID)}</b></label>
							<label style={{ backgroundColor: "#e0e0e0", textAlign:"center" }}><b>{numberWithCommas(total.FORGIVEN + total.SCHOLARSHIP)}</b></label>
							<label style={{ backgroundColor: "#fc6171", textAlign:"center"}}><b>{numberWithCommas(Math.abs(total.OWED - (total.PAID + total.FORGIVEN)))}</b></label>
						</div>
					]
				}
			</div> 
				
	}

	const numberWithCommas = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

class FeeAnalytics extends Component {

	constructor(props) {
	  super(props)
	
	  this.state = {
		 filterText: "",
		 chartFilter: {
			 paid: true,
			 forgiven: true,
			 pending: true,
			 total: true
		 },
		 classFilter: ""
	  }

	  this.former = new Former(this, [])
	}

	calculateDebt = ({SUBMITTED, FORGIVEN, OWED, SCHOLARSHIP}) => SUBMITTED + FORGIVEN + SCHOLARSHIP - OWED;

	
  render() {

	// first make sure all students payments have been calculated... (this is for dues)

	// outstanding money
	// who owes it, and how much
	// graph of paid vs due per month.

	const {students, settings, addPayments, schoolLogo} = this.props

	let total_paid = 0;
	let total_owed = 0;
	let total_forgiven = 0;
	let total_scholarship = 0;
	let monthly_payments = {}; // [MM-DD-YYYY]: { due, paid, forgiven }
	let total_student_debts = {}; // [id]: { due, paid, forgiven }
	let total_debts = {};
	// first update fees

	const nextPayments = Object.values(students)
		.reduce((agg, student) => ([...agg, ...checkStudentDuesReturning(student)]), []);

	if(nextPayments.length > 0) {
		console.log(nextPayments)
		addPayments(nextPayments)
	}


	for(let sid in students) {
		const student = students[sid];

		let debt = { OWED: 0, SUBMITTED: 0, FORGIVEN: 0, SCHOLARSHIP: 0}
		
		for(let pid in student.payments || {}) {
			const payment = student.payments[pid];

			const amount = parseFloat(payment.amount)

			// totals
			amount < 0 ? debt["SCHOLARSHIP"] += Math.abs(amount) : debt[payment.type] += amount;

			// monthly
			const month_key = moment(payment.date).format("MM/YYYY");
			const month_debt = monthly_payments[month_key] || { OWED: 0, SUBMITTED: 0, FORGIVEN: 0, SCHOLARSHIP: 0}
			
			amount < 0 ? month_debt["SCHOLARSHIP"] += Math.abs(amount) : month_debt[payment.type] += amount;
			monthly_payments[month_key] = month_debt;

		}

		total_paid += debt.SUBMITTED;
		total_owed += debt.OWED;
		total_forgiven += debt.FORGIVEN;
		total_scholarship += debt.SCHOLARSHIP;
		

		total_student_debts[sid] = { student, debt };

		total_debts = { PAID: total_paid, OWED: total_owed, FORGIVEN: total_forgiven, SCHOLARSHIP: total_scholarship }
	}

	const items = Object.values(total_student_debts)
		.filter(({student, debt}) => (
			student.id && student.Name) &&
			(this.state.classFilter === "" || 
			student.section_id === this.state.classFilter ) &&
			student.Name.toUpperCase().includes(this.state.filterText.toUpperCase())
		)

	const sections = Object.values(getSectionsFromClasses(this.props.classes))
	
	return <div className="fees-analytics">

		<PrintHeader 
			settings={settings} 
			logo={schoolLogo}
		/>
		
		<div className="no-print" style={{ marginRight:"10px" }}>
			<div className="divider">Payments over Time</div>
			<MonthlyFeesChart 
				monthly_payments={monthly_payments} 
				filter={this.state.chartFilter}
			/>
		</div>
		
		<div className="no-print checkbox-container">
			
			<div className="chart-checkbox" style={{ color:"#93d0c5" }}>
				<input
					type="checkbox" 
					{...this.former.super_handle([ "chartFilter", "paid" ])}
				/>
				Paid 
			</div>

			<div className="chart-checkbox" style={{ color:"#939292" }}>
				<input
					type="checkbox"
					{...this.former.super_handle([ "chartFilter", "forgiven" ])}
				/>
				Forgiven
			</div>

			<div className="chart-checkbox" style={{ color:"#ff6b68" }}>
				<input
					type="checkbox"
					{...this.former.super_handle([ "chartFilter", "pending" ])}
				/> 
				Pending
			</div>

			<div className="chart-checkbox" style={{ color:"#74aced" }}>
				<input
					type="checkbox"
					{...this.former.super_handle([ "chartFilter", "total" ])}
				/> 
				Total
			</div>
		
		</div>

		<MonthlyFeesTable monthly_payments={monthly_payments} total_debts={total_debts}/>

		<div className="divider">Students with Payments Outstanding</div>
		<div className="section">
		
		<div className="no-print row">
			<input
				className="search-bar"
				type="text"
				{...this.former.super_handle(["filterText"])}
				placeholder = "search"
			/>
			<select {...this.former.super_handle(["classFilter"])}>
				<option value=""> Select Class </option>
				{
					sections
						.map(s => {
							return <option value={s.id} key={s.id}> {s.namespaced_name}</option>
						})
				}
			</select>
		</div>
		<div className="table row">
				<label><b>Name</b></label>
				<label><b>Amount</b></label>
		</div>
		{
			items
			.filter(({ student, debt }) => (student.tags === undefined ) || (!student.tags["PROSPECTIVE"]))
			.sort((a, b) => this.calculateDebt(a.debt) - this.calculateDebt(b.debt))
			.map(({ student, debt }) => <div className="table row" key={student.id}>
					<Link to={`/student/${student.id}/payment`}>{student.Name}</Link>
					<div  style={ (-1 * this.calculateDebt(debt)) < 1 ? {color:"#5ecdb9"} : {color:"#fc6171" } } > {numberWithCommas(-1 * this.calculateDebt(debt))}</div>
				</div>)
		}
		<div className="print button" onClick={() => window.print()} style={{ marginTop: "10px" }}>Print</div>
		</div>

	</div>
  }
}
export default connect(state => ({
	students: state.db.students,
	settings: state.db.settings,
	classes: state.db.classes,
	schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : "" 
}), dispatch => ({
	addPayments: payments => dispatch(addMultiplePayments(payments))
}))(FeeAnalytics)
