import React from "react"
import "../../print.css"
import moment from "moment"

type PropsTypes = {
    items: any
    chunkSize: number
    schoolName: string
}

export const GeneralExpensePrintableList = (props: PropsTypes) => {
    return (
        <div className="print-only print-table">
            <table>
                <caption>
                    <div>{ props.schoolName ? props.schoolName.toUpperCase() : "" }</div>
                    <div>Expense List</div>
                </caption>
                <thead>
                    <tr>
                        <th className="row-date">Date</th>
                        <th className="row-label">Label</th>
                        <th className="row-category">Category</th>
                        <th className="row-quantity">Quantity</th>
                        <th className="row-deduction">Deduction</th>
                        <th className="row-amount">Amount</th>
                    </tr>
                </thead>

                <tbody>
                {
                    props.items.map(([id, exp]: any, i: number) => {
                    if(exp.expense === "SALARY_EXPENSE") {
                        return <tr key={id}>
                            <td>{moment(exp.date).format("DD-MM-YYYY")}</td>
                            <td>{exp.label}</td>
                            <td>{exp.category}</td>
                            <td className="cell-center"> - </td>
                            <td className="cell-center">{exp.deduction}{ exp.deduction_reason ? `(${exp.deduction_reason})` : "" }</td>
                            <td className="cell-center">{exp.amount - exp.deduction}</td>
                        </tr>
                    } else {
                        return <tr key={id}>
                            <td>{moment(exp.date).format("DD-MM-YYYY")}</td>
                            <td>{exp.label}</td>
                            <td>{exp.category}</td>
                            <td className="cell-center">{exp.quantity}</td>
                            <td className="cell-center"> - </td>
                            <td className="cell-center">{exp.amount}</td>
                        </tr>
                    }})
                }
                </tbody>
            </table>
        </div>
    )
}