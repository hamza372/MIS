import moment from 'moment'
import { v4 } from 'node-uuid'

export default function checkStudentDues(student, addPayment) {
	const curr = moment().format("MM/YYYY")

	for(let [id, fee] of Object.entries(student.fees || {})) {
		if(fee.period === "MONTHLY") {
			// check if this fee exists in "owed" column.

			const existing_monthly = Object.values(student.payments || {}).find(p => p.fee_id === id && moment(p.date).format("MM/YYYY") === curr);
			if(existing_monthly === undefined) { // there is no payment for this month owed yet
				// create it
				const amount = (fee.type === "FEE" ? 1 : -1) * fee.amount;
				addPayment(student, v4(), amount, moment().startOf('month').unix() * 1000, "OWED", id, fee.name);
			}
		}

		if(fee.period === "SINGLE") {
			const existing_one_time = Object.values(student.payments || {}).find(p => p.fee_id === id);
			if(existing_one_time === undefined) {
				const amount = (fee.type === "FEE" ? 1: -1) * fee.amount;
				addPayment(student, v4(), amount, moment.now(), "OWED", id, fee.name);
			}
		}
	}
}