import React from 'react'

import './style.css'
import moment from 'moment';
import getFeeLabel from 'utils/getFeeLabel';
import numberWithCommas from 'utils/numberWithCommas';

type propsType = {
    settings: MISSettings
    voucherNo: number
    className: string
    student: MISStudent
    payments: any
}

export const SingleStudentPrintableFeeVoucher = (props: propsType) => {
    
    const owed = props.payments.reduce((agg: any, [,curr]: any) => agg - (curr.type === "SUBMITTED" || curr.type === "FORGIVEN" ? 1 : -1) * curr.amount, 0)

    return(
        <div className="printable-single-voucher">
            <div className="row">
                <div className="voucher-no text-left">Voucher no: {props.voucherNo}</div>
                
                <div className="school-info text-center">
                        <div className="school-name">{props.settings.schoolName ? props.settings.schoolName : ""}</div>
                        <div>{props.settings.schoolAddress}</div>
                        <div>Tel:{props.settings.schoolPhoneNumber}</div>
                </div>

                <div className="voucher-print-date text-right">Date: {moment().format("DD-MM-YYYY")}</div>
            </div>
            <div className="row">
                <div className="student-name">Name: <b> {props.student.Name}</b> </div>
                <div className="student-class">Class: <b> {props.className}</b> </div>
            </div>
            <div className="row">
                <div className="admission-no">Admission no: <b>{props.student.AdmissionNumber}</b> </div>
                <div className="roll-no">Roll no: <b>{props.student.RollNumber}</b> </div>
            </div>
            <div className="text-center payment-row">Payment Details</div>
            <div className="section">
                <div className="table row">
                    <label>Month</label>
                    <label>Label</label>
                    <label>Amount</label>
                </div>
                {
                    props.payments
                    .filter(([id, payment]: any) => payment.type !== "SUBMITTED")
                    .map(([id, payment]: any) => {
                        return <div key={id} >
                            <div className="table row">
							    <div>{moment(payment.date).format("MMMM")}</div>
                                <div>{getFeeLabel(payment)}</div>
                                <div>{numberWithCommas(payment.amount)}</div>
                            </div>
                        </div>})
                }
                
            <div className="table row last" style={{borderTop: "1px dotted"}}>
				<label><b>Total Amount</b></label>
				<div><b>Rs. {numberWithCommas(owed)}</b></div>
			</div>
                
            </div>
            <div className="row voucher-signature line">
				<div>_______________</div>
				<div className="text-right">_________________</div>
			</div>	
			<div className="row voucher-signature">
				<div>Principal Signature</div>
				<div className="text-right">Accountant Signature</div>
			</div>
        </div>);
}