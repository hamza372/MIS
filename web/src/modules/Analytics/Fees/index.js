import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import moment from 'moment'

import { checkStudentDuesReturning } from 'utils/checkStudentDues'
import { addMultiplePayments } from 'actions'

import { ResponsiveContainer, Bar, Legend, XAxis, YAxis, ComposedChart, Tooltip } from 'recharts'

export default connect(state => ({
	students: state.db.students
}), dispatch => ({
	addPayments: payments => dispatch(addMultiplePayments(payments))
}))(({ students, addPayments }) => {

	// first make sure all students payments have been calculated... (this is for dues)

	// outstanding money
	// who owes it, and how much
	// graph of paid vs due per month.

	let total_paid = 0;
	let total_owed = 0;
	let total_forgiven = 0;
	let monthly_payments = {}; // [MM-DD-YYYY]: { due, paid, forgiven }
	let total_student_debts = {} // [id]: { due, paid, forgiven }

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
	}

	return <div className="fees-analytics">
		<div className="table row">
			<label>Total Paid</label>
			<div>{total_paid}</div>
		</div>
		<div className="table row">
			<label>Total Owed</label>
			<div>{total_owed}</div>
		</div>
		<div className="table row">
			<label>Total Forgiven</label>
			<div>{total_forgiven}</div>
		</div>
		<div className="table row">
			<label><b>Total Outstanding</b></label>
			<div>{total_paid + total_forgiven - total_owed}</div>
		</div>
		
		<div className="divider">Payments over Time</div>

		<ResponsiveContainer width="100%" height={500}>

			<ComposedChart data={Object.entries(monthly_payments).map(([month, { OWED, SUBMITTED, FORGIVEN }]) => ({
				month, OWED, SUBMITTED, FORGIVEN, net: SUBMITTED - OWED - FORGIVEN
			}))}>

				<Legend />
				<XAxis dataKey="month" />
				<YAxis />
				<Tooltip />
				<Bar dataKey="SUBMITTED" stackId="a" fill="#aaaaaa" name="Payed" />
				<Bar dataKey="FORGIVEN" stackId="a" fill="#95B8D1" name="Forgiven" />
				<Bar dataKey='net' name="Profit" fill="#222222" />
			</ComposedChart>
		</ResponsiveContainer>

		<div className="divider">Students with Payments Outstanding</div>
		{
			Object.values(total_student_debts)
				.sort((a, b) => calculateDebt(a.debt) - calculateDebt(b.debt))
				.map(({ student, debt }) => <div className="table row" key={student.id}>
					<Link to={`/student/${student.id}/payment`}>{student.Name}</Link>
					<div>{calculateDebt(debt)}</div>
				</div>)
		}

	</div>
})

const calculateDebt = ({SUBMITTED, FORGIVEN, OWED}) => SUBMITTED + FORGIVEN - OWED;
