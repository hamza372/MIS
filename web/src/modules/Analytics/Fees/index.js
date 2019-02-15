import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import moment from 'moment'

import { checkStudentDuesReturning } from 'utils/checkStudentDues'
import { addMultiplePayments } from 'actions'
import { PrintHeader } from 'components/Layout'

import { ResponsiveContainer, Bar, Legend, XAxis, YAxis, ComposedChart, Tooltip } from 'recharts'

const MonthlyFeesChart = (props) => {
			
	return <ResponsiveContainer width="100%" height={200}>
				<ComposedChart data={
						Object.entries(props.monthly_payments)
							.sort(([m1,], [m2,]) => moment(m1, "MM/YYYY").diff(moment(m2, "MM/YYYY")))
							.map(([month, { OWED, SUBMITTED, FORGIVEN }]) => ({
								month, OWED, SUBMITTED, FORGIVEN, net: SUBMITTED - OWED 
							}))}>
					<Legend />
					<XAxis dataKey="month" />
					<YAxis />
					<Tooltip />

					<Bar dataKey='OWED' name="Owed" fill="#74aced" />
					<Bar dataKey="SUBMITTED" stackId="a" fill="#5ecdb9" name="Paid" />
					<Bar dataKey="FORGIVEN" stackId="a" fill="#e0e0e0" name="Forgiven" />
					<Bar dataKey='net' name="Paid - Owed" fill="#ff6b68" />

			  </ComposedChart>
			</ResponsiveContainer> 
}

const MonthlyFeesTable = (props) => {
	
	const total = props.total_debts;
	const monthly_payments = props.monthly_payments;

return <div className="section table" style={{margin: "20px 0"}}>
			<div className="table row heading">
				<label><b>Date</b></label>
				<label><b>Owed</b></label>
				<label><b>Paid</b></label>
				<label><b>Forgiven</b></label>
				<label><b>Paid - Owed</b></label>
			</div>
			{
				[...Object.entries(monthly_payments)
					.sort(([m1, ], [m2, ]) => moment(m1, "MM/YYYY").diff(moment(m2, "MM/YYYY")))
					.map(([month, { OWED, SUBMITTED, FORGIVEN }]) => {
													
						const prof = SUBMITTED - OWED;
						const red = "#FC6171"

						return <div className="table row" key={month}>
							<div>{month}</div>
							<div>{OWED}</div>
							<div>{SUBMITTED}</div>
							<div>{FORGIVEN}</div>
							<div style={{ color: prof < 0 ? red : "inherit" }}>{SUBMITTED - OWED}</div>
						</div>
					}),
					<div className="table row footing" key={Math.random()}>   
						<label><b>Total</b></label>
						<label><b>{total.OWED}</b></label>
						<label><b>{total.PAID}</b></label>
						<label><b>{total.FORGIVEN}</b></label>
						<label style={{color: (total.PAID - total.OWED < 0 ? "#FC6171" : "inherit") }}><b>{-total.OWED + total.PAID}</b></label>
					</div>
				]
			}
		</div> 
			
} 

export default connect(state => ({
	students: state.db.students,
	settings: state.db.settings
}), dispatch => ({
	addPayments: payments => dispatch(addMultiplePayments(payments))
}))(({ students, addPayments, settings }) => {

	// first make sure all students payments have been calculated... (this is for dues)

	// outstanding money
	// who owes it, and how much
	// graph of paid vs due per month.

	let total_paid = 0;
	let total_owed = 0;
	let total_forgiven = 0;
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

		let debt = { OWED: 0, SUBMITTED: 0, FORGIVEN: 0}
		for(let pid in student.payments || {}) {
			const payment = student.payments[pid];

			const amount = parseFloat(payment.amount)

			// totals
			debt[payment.type] += amount;

			// monthly
			const month_key = moment(payment.date).format("MM/YYYY");
			const month_debt = monthly_payments[month_key] || { OWED: 0, SUBMITTED: 0, FORGIVEN: 0}
			month_debt[payment.type] += amount;
			monthly_payments[month_key] = month_debt;

		}

		total_paid += debt.SUBMITTED;
		total_owed += debt.OWED;
		total_forgiven += debt.FORGIVEN;

		total_student_debts[sid] = { student, debt };

		total_debts = { PAID: total_paid, OWED: total_owed, FORGIVEN: total_forgiven}
	}

	return <div className="fees-analytics">
		
		<PrintHeader settings={settings} />
		
	
		<div className="no-print">
			<div className="divider">Payments over Time</div>
			<MonthlyFeesChart monthly_payments={monthly_payments}/>
		</div>
		<MonthlyFeesTable monthly_payments={monthly_payments} total_debts={total_debts}/>

		<div className="divider">Students with Payments Outstanding</div>
		<div className="section">
		{
			Object.values(total_student_debts)
				.sort((a, b) => calculateDebt(a.debt) - calculateDebt(b.debt))
				.filter(({ student, debt }) => (student.tags === undefined ) || (!student.tags["PROSPECTIVE"]) )
				.map(({ student, debt }) => <div className="table row" key={student.id}>
					<Link to={`/student/${student.id}/payment`}>{student.Name}</Link>
					<div>{calculateDebt(debt)}</div>
				</div>)
		}
		<div className="print button" onClick={() => window.print()} style={{ marginTop: "10px" }}>Print</div>
		</div>

	</div>
})

const calculateDebt = ({SUBMITTED, FORGIVEN, OWED}) => SUBMITTED + FORGIVEN - OWED;
