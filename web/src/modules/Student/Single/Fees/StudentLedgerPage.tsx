import React from 'react'
import { PrintHeader } from "components/Layout";
import numberWithCommas from "utils/numberWithCommas";
import moment from "moment";
import getFeeLabel from "utils/getFeeLabel";


interface StudentLedgerPageProp {
	payments: [string, MISStudentPayment][]; 
	student: MISStudent;
	class_name: string;
	settings: RootDBState["settings"];
}

export const StudentLedgerPage: React.SFC < StudentLedgerPageProp > = ({ payments, student, settings, class_name }) => {

	const owed = payments.reduce((agg, [,curr]) => agg - (curr.type === "SUBMITTED" || curr.type === "FORGIVEN" ? 1 : -1) * curr.amount, 0)

	const totalOwed = Object.entries(student.payments || {})
		.sort(([, a_payment], [, b_payment]) => a_payment.date - b_payment.date)
		.reduce((agg, [,curr]) => agg - (curr.type === "SUBMITTED" || curr.type === "FORGIVEN" ? 1 : -1) * curr.amount, 0)

	return <div className="payment-history section print-page" >
			<PrintHeader settings={settings} logo={""}/>

			<div className="divider">Student Information</div>
				<div className="row info">
					<label> Name:</label>
					<div>{student.Name}</div>
				</div>
				<div className="row info">
					<label> Father Name:</label>
					<div>{student.ManName}</div>
				</div>
				<div className="row info">
					<label> Class Name:</label>
					<div>{class_name}</div>
				</div>
				<div className="row info">
					<label> Roll #:</label>
					<div>{student.RollNumber}</div>
				</div>
				<div className="row info">
					<label> Adm # :</label>
					<div>{student.AdmissionNumber}</div>
				</div>
				<div className="row info">
					<label style={{ color: owed <= 0 ? "#5ECDB9" : "#FC6171" }}> {owed <= 0 ? "Total Advance:" : "Total Pending:"}</label>
					<div style={{ color: owed <= 0 ? "#5ECDB9" : "#FC6171" }}>{`Rs. ${numberWithCommas(Math.abs(totalOwed))}`}</div>
				</div>

			<div className="divider">Payment Information</div>

			<div className="table row heading">
				<label><b>Date</b></label>
				<label><b>Label</b></label>
				<label><b>Amount</b></label>
			</div>

			{payments
				.map(([id, payment]) => {

					return <div className="payment" key={id} >
						<div className="table row">
							<div>{moment(payment.date).format("DD/MM")}</div>
							<div>{getFeeLabel(payment)}</div>
							<div>{numberWithCommas(payment.amount)}</div>
						</div>
					</div>
				}
			)}

			<div className="table row last">
				<label style={{ color: owed <= 0 ? "#5ECDB9" : "#FC6171" }}><b>{owed <= 0 ? "Advance:" : "Pending:"}</b></label>
				<div style={{ color: owed <= 0 ? "#5ECDB9" : "#FC6171" }}><b>Rs. {numberWithCommas( Math.abs(owed))}</b></div>
			</div>
	</div>
}