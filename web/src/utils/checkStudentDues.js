import moment from 'moment'

export function checkStudentDuesReturning(student) {
	const curr = moment().format("MM/YYYY")

	let payments = []

	for(let [id, fee] of Object.entries(student.fees || {})) {
		if(fee.period === "MONTHLY") {
			// check if this fee exists in "owed" column.

			const existing_monthly = Object.values(student.payments || {})
				.find(p => {
					return p.fee_id === id && moment(p.date).format("MM/YYYY") === curr
				});
			if(existing_monthly === undefined) { // there is no payment for this month owed yet
				// create it
				const amount = (fee.type === "FEE" ? 1 : -1) * fee.amount;
				// addPayment(student, v4(), amount, moment().startOf('month').unix() * 1000, "OWED", id, fee.name);

				payments.push({
					student,
					payment_id: `${curr}-${id}`,
					amount,
					date: moment().startOf('month').unix() * 1000, 
					type: "OWED",
					fee_id: id,
					fee_name: fee.name
				});

			}
		}

		if(fee.period === "SINGLE") {
			const existing_one_time = Object.values(student.payments || {})
				.find(p => p.fee_id === id);
			if(existing_one_time === undefined) {
				const amount = (fee.type === "FEE" ? 1: -1) * fee.amount;
				//addPayment(student, v4(), amount, moment.now(), "OWED", id, fee.name);

				payments.push({
					student,
					payment_id: id,
					amount,
					date: moment.now(),
					type: "OWED",
					fee_id: id,
					fee_name: fee.name
				});
			}
		}
	}

	return payments;
}