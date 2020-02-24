import React from 'react'
import { PrintHeader } from "components/Layout";
import numberWithCommas from "utils/numberWithCommas";
import moment from "moment";
import getFeeLabel from "utils/getFeeLabel";

interface LedgerPageProp {
	relevant_payments: { [id: string]: { filteredPayments: [string, MISStudentPayment][]; owed: number; totalOwed: number }}
	settings: RootDBState["settings"]
	students: RootDBState["students"]
	curr_class: MISClass
}

export const LedgerPage: React.SFC < LedgerPageProp > = ({ relevant_payments, students, settings, curr_class }) => {

	return <div className="payment-history">
	{
		Object.entries(relevant_payments)
			.map(([s_id, {filteredPayments, owed, totalOwed}]) => {
			
			const curr_student = students[s_id]
			return <div className="payment-history section print-page">
			<PrintHeader settings={settings} logo={""}/>
			<div className="divider">Student Information</div>
				<div className="row info">
					<label> Name:</label>
					<div>{curr_student.Name}</div>
				</div>
				<div className="row info">
					<label> Father Name:</label>
					<div>{curr_student.ManName}</div>
				</div>
				<div className="row info">
					<label> Class Name:</label>
					<div>{curr_class.name}</div>
				</div>
				<div className="row info">
					<label> Roll #:</label>
					<div>{curr_student.RollNumber}</div>
				</div>
				<div className="row info">
					<label> Adm # :</label>
					<div>{curr_student.AdmissionNumber}</div>
				</div>
				<div className="row info">
					<label style={{ color: owed <= 0 ? "#5ECDB9" : "#FC6171" }}> {owed <= 0 ? "Total Advance:" : "Total Pending:"}</label>
					<div style={{ color: owed <= 0 ? "#5ECDB9" : "#FC6171" }}>{` Rs. ${numberWithCommas(Math.abs(totalOwed))}`}</div>
				</div>
				
			<div className="divider">Payment Information</div>

			<div className="table row heading">
				<label><b>Date</b></label>
				<label><b>Label</b></label>
				<label><b>Amount</b></label>
			</div>

			{filteredPayments
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
				<div style={{ color: owed <= 0 ? "#5ECDB9" : "#FC6171" }}><b>{numberWithCommas( Math.abs(owed))}</b></div>
			</div>
			</div>
		})
	}
	</div>
}