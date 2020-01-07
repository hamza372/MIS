import React from "react"
import "./../print.css"

type PropsTypes = {
    students: AugmentedStudent[]
    totalAmount: number
    totalStudents: number
    chunkSize: number
}

type AugmentedStudent = MISStudent & { amount_paid: number, section: AugmentedSection }

export const PaidFeeStudentsPrintableList = (props: PropsTypes) => {

    return (
        <div className="print-only print-table" style={{width: "90%"}}>
            <table>
                <caption>
                    <div>Paid Fee Students List</div>
                    <div className="row" style={{justifyContent: "space-between"}}>
                        <div>Total Students: <b>{props.totalStudents}</b></div>
                        <div>Total Amount Received: <b>Rs. {props.totalAmount}</b></div>
                    </div>
                </caption>
                <thead>
                    <tr><th className="row-sr">Adm #</th>
                        <th className="row-name">Name</th>
                        <th className="row-class">Class</th>
                        <th className="row-roll">Roll #</th>
                        <th className="row-amount">Amount Paid</th>
                    </tr>
                </thead>
                <tbody>
                   {
                        props
                            .students
                            .sort((a, b) => a.section.classYear - b.section.classYear)
                            .map(student => <tr key={student.id}>
                                <td className="cell-center">{student.AdmissionNumber || ''}</td>
                                <td>{student.Name}</td>
                                <td>{student.section.namespaced_name || ''}</td>
                                <td className="cell-center">{student.RollNumber || ''}</td>
                                <td className="cell-center">{student.amount_paid}</td>
                            </tr>)
                   }
                </tbody>
            </table>
        </div>)
}