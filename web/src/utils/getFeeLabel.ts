export const getFeeLabel = (payment: MISStudentPayment): string => {
	
	switch (payment.type) {
		case "SUBMITTED":
			return "Paid"
		case "FORGIVEN": 
			return "Need Scholarship"
		default:
			return payment.fee_name || "Fee"
	}
}

export default getFeeLabel