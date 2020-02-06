import React from "react"
import toTitleCase from "utils/toTitleCase"

import "./../print.css"

type PropsTypes = {
    students: AugmentedStudent[]
    totalAmount: number
    totalStudents: number
    chunkSize: number
    paidDate: string
}

type AugmentedStudent = MISStudent & { amount_paid: number, balance: number, section: AugmentedSection }

export const PaidFeeStudentsPrintableList = (props: PropsTypes) => {

    return (
        <div className="print-only print-table" style={{width: "95%"}}>
            <table style={{marginBottom: "1cm"}}>
                <caption>
                    <div>Paid Fee Students List - {props.paidDate}</div>
                    <div className="row" style={{justifyContent: "space-between"}}>
                        <div>Total Students: <b>{props.totalStudents}</b></div>
                        <div>Total Amount Received: <b>Rs. {props.totalAmount}</b></div>
                    </div>
                </caption>
                <thead>
                    <tr><th className="row-sr">Adm No</th>
                        <th className="row-name">Name</th>
                        <th className="row-famid">Family ID</th>
                        <th className="row-class">Class</th>
                        <th className="row-roll">Roll No</th>
                        <th className="row-amount-paid">Amount Paid</th>
                        <th className="row-amount-balance">Balance</th>
                    </tr>
                </thead>
                <tbody>
                   {
                        props
                            .students
                            .sort((a, b) => ((a.section && a.section.classYear) || 0) - ((b.section && b.section.classYear) || 0))
                            .map(student => <tr key={student.id}>
                                <td className="cell-center">{student.AdmissionNumber || ''}</td>
                                <td>{toTitleCase(student.Name)}</td>
                                <td className="cell-center">{student.FamilyID || ''}</td>
                                <td>{(student.section && student.section.namespaced_name) || ''}</td>
                                <td className="cell-center">{student.RollNumber || ''}</td>
                                <td className="cell-center">{student.amount_paid}</td>
                                <td className="cell-center">{student.balance}</td>
                            </tr>)
                   }
                </tbody>
            </table>
        </div>)
}