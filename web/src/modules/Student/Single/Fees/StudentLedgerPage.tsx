import React from 'react'
import { PrintHeaderSmall } from "components/Layout"
import numberWithCommas from "utils/numberWithCommas"
import toTitleCase from 'utils/toTitleCase'

import moment from "moment"

interface StudentLedgerPageProp {
	payments: [string, MISStudentPayment][]
	student?: MISStudent
	family?: AugmentedMISFamily
	section?: AugmentedSection
	settings: RootDBState["settings"]
	logo?: string
	voucherNo?: number
	css_style?: "print-only" | "no-print" | ""
	month?: string
	year?: string
}

const DefaultOptions: RootDBState["settings"]["classes"]["feeVoucher"]["options"] = {
	showDueDays: false,
	showFine: false,
	showNotice: false,
	showBankInfo: false
}

export const StudentLedgerPage: React.SFC<StudentLedgerPageProp> = ({ payments, student, settings, section, voucherNo, css_style, family, logo, month, year }) => {

	const siblingsCount = family && family.ID ? family.children.length : 1 // 1 in case of single student fee voucher
	const voucherFor = family && family.ID ? "Family" : "Student"

	const voucherSettings = settings && settings.classes && settings.classes.feeVoucher ? settings.classes.feeVoucher : undefined

	const { showDueDays, showFine, showNotice, showBankInfo } = (voucherSettings && voucherSettings.options) || DefaultOptions

	// get the due days and curr month days till current date
	const dueDays = parseInt(voucherSettings ? voucherSettings.dueDays : "0")
	const currMonthDays = moment().days()

	let totalFeeFine = 0

	if (showFine && currMonthDays >= dueDays) {

		const fee_late_days = currMonthDays - dueDays
		const fee_fine = parseInt(voucherSettings ? voucherSettings.feeFine : "0") // fee fine per day

		totalFeeFine = fee_late_days * fee_fine * siblingsCount
	}

	const fees = getMergedFees(family, student)
	const owed = payments.reduce((agg, [, curr]) => agg - (curr.type === "SUBMITTED" || curr.type === "FORGIVEN" ? 1 : -1) * curr.amount, 0)

	const totalMonthlyFees = Object.values(fees).reduce((agg, curr) => curr.type === "FEE" && curr.period === "MONTHLY" ? agg + parseFloat(curr.amount) : agg, 0)
	const totalOneTimeFees = Object.values(fees).reduce((agg, curr) => curr.type === "FEE" && curr.period === "SINGLE" ? agg + parseFloat(curr.amount) : agg, 0)


	return <div className={`payment-history section print-page ${css_style}`}>

		<PrintHeaderSmall settings={settings} logo={logo} />

		<div className="voucher-heading text-uppercase text-center bold">Fee Receipt - {month} {year}</div>
		{
			voucherFor === "Student" ?
				<>
					<div className="row info">
						<label>Student Name:</label>
						<div>{toTitleCase(student.Name)}</div>
					</div>
					<div className="row info">
						<label>Father Name:</label>
						<div>{toTitleCase(student.ManName)}</div>
					</div>
					<div className="row info">
						<label>Class:</label>
						<div>{section ? section.namespaced_name : ""}</div>
					</div>
					<div className="row info">
						<label>Admission No:</label>
						<div>{student.AdmissionNumber}</div>
					</div>
					<div className="row info">
						<label>Voucher No:</label>
						<div>{voucherNo}</div>
					</div>
				</> :
				<>
					<div className="row info">
						<label>Family ID:</label>
						<div>{family.ID}</div>
					</div>
					<div className="row info">
						<label>Father Name:</label>
						<div>{family.ManName}</div>
					</div>
					<div className="row info">
						<label>Phone</label>
						<div>{family.Phone}</div>
					</div>
					<div className="row info">
						<label>Total Siblings</label>
						<div>{siblingsCount}</div>
					</div>
					<div className="row info">
						<label>Voucher No:</label>
						<div>{voucherNo}</div>
					</div>
				</>
		}

		<div className="voucher-heading text-uppercase text-center bold">PAYMENT INFORMATION</div>

		<div className="print-table">
			<table style={{ width: "100%" }}>
				<thead>
					<tr>
						<th style={{ width: voucherFor === "Student" ? "70%" : "50%" }}>Description</th>
						<th className="text-center">Amount</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Total Monthly Fee</td>
						<td className="text-center" >{totalMonthlyFees}</td>
					</tr>
					<tr>
						<td>Total One-Time Fee</td>
						<td className="text-center">{totalOneTimeFees}</td>
					</tr>
					<tr>
						<td className={owed > 0 ? "pending-amount" : ""} >Balance/Arrears</td>
						<td className="bold text-center">{owed > 0 ? numberWithCommas(owed) : "-"}</td>
					</tr>
					<tr>
						<td className={owed <= 0 ? "advance-amount" : ""}>Advance</td>
						<td className="bold text-center">{owed <= 0 ? numberWithCommas(Math.abs(owed)) : "-"}</td>
					</tr>
					<tr>
						<td>Late Fee Fine</td>
						<td className="text-center">{totalFeeFine > 0 ? totalFeeFine : "-"}</td>
					</tr>
					<tr className="bold">
						<td>Total Payable</td>
						<td className="text-center">Rs. {numberWithCommas(owed + totalFeeFine)}</td>
					</tr>
				</tbody>
			</table>
		</div>

		<div className="bank-info">
			{
				showBankInfo && <fieldset>
					<legend>Bank Information</legend>
					<div className="row info">
						<label>Bank Name:</label>
						<div>{voucherSettings && voucherSettings.bankInfo ? voucherSettings.bankInfo.name : ""}</div>
					</div>
					<div className="row info">
						<label>Account Title:</label>
						<div>{voucherSettings && voucherSettings.bankInfo ? voucherSettings.bankInfo.accountTitle : ""}</div>
					</div>
					<div className="row info">
						<label>Account No:</label>
						<div>{voucherSettings && voucherSettings.bankInfo ? voucherSettings.bankInfo.accountNo : ""}</div>
					</div>
				</fieldset>
			}
		</div>

		<div className="fee-notice">
			{
				showNotice && <fieldset>
					<legend>Fee Notice</legend>
					<div>{voucherSettings ? voucherSettings.notice : ''}</div>
				</fieldset>
			}
		</div>
		<div className="row info bold">
			{
				showDueDays && <>
					<label>Due Date</label>
					<div>{moment(`${month} ${year}`, "MMMM YYYY").add(dueDays, "days").format("DD/MM/YYYY")}</div>
				</>
			}
		</div>

		<div className="row info bold" style={{ marginTop: 0 }} >
			<label>Date of Issue</label>
			<div>{moment().format("DD/MM/YYYY")}</div>
		</div>

		{
			voucherNo && <div className="print-only">
				<div className="row voucher-signature" style={{ marginTop: 10 }}>
					<div>Principal Signature</div>
					<div>Accountant Signature</div>
				</div>
			</div>
		}
	</div>
}

export const getMergedFees = (family: AugmentedMISFamily, single_student: MISStudent) => {

	const siblings = family && family.children

	if (!siblings || siblings.length === 0) {
		return single_student.fees
	}

	return siblings.reduce((agg, curr) => ({
		...agg,
		...Object.entries(curr.fees)
			.reduce((agg, [fid, f]) => {
				return {
					...agg,
					[fid]: {
						...f
					}
				}
			}, {} as MISStudent['fees'])
	}), {} as { [id: string]: MISStudentFee })

}