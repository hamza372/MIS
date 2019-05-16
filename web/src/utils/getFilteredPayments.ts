import moment from 'moment'

const getPaymentFilterCondition = (payment: MISStudentPayment, year: string, month: string) =>
{
	//when both are empty
	if(month === "" && year === "") {
		return true
	}
	//when month is empty	
	if(month === "" && year !== ""){
		return  moment(payment.date).format("YYYY") === year;

	}
	//when year is empty
	if(month !== "" && year === ""){
		return moment(payment.date).format("MMMM") === month

	}
	//when both are not empty
	if(month !== "" && year !== "")
	{
		return moment(payment.date).format("MMMM") === month && moment(payment.date).format("YYYY") === year;
	}
}

export const getFilteredPayments = (student: MISStudent, year: string, month: string) => {
	return Object.entries(student.payments || {})
		.filter(([id,payment]) => getPaymentFilterCondition(payment, year, month))
		.sort(([, a_payment], [, b_payment]) => a_payment.date - b_payment.date)
}

export default getFilteredPayments