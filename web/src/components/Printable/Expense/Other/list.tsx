import React from "react"
import moment from "moment"

import "../../print.css"

type PropsTypes = {
    items: any
    chunkSize: number
    schoolName: string
    dateFormat: string
}

export const IncomeExpenditurePrintableList = (props: PropsTypes) => {
    const dateView = props.dateFormat === "DAILY" ? "DD-MM-YY" : "MM-YYYY"
    return (
        <div className="print-only print-table">
            <table>
                <caption>
                    <div>{props.schoolName ? props.schoolName.toUpperCase() : ""}</div>
                    <div>Income-Expenditure List - {moment().format("DD/MM/YYYY")}</div>
                </caption>
                <thead>
                    <tr>
                        <th className="row-date">Date</th>
                        <th className="row-label">Label</th>
                        <th className="row-category">Category</th>
                        <th className="row-quantity">Quantity</th>
                        <th className="row-amount">Amount</th>
                    </tr>
                </thead>

                <tbody>
                    {
                        props.items.map(([id, expense]: any) => <tr key={id}>
                            <td className="cell-center">{moment(expense.date).format(dateView)}</td>
                            <td> {expense.label}</td>
                            <td> {expense.category}</td>
                            <td className="cell-center"> {expense.quantity} {expense.quantity !== 1 ? "Entries" : "Entry"}</td>
                            <td className="cell-center"> {expense.amount}</td>
                        </tr>)
                    }
                </tbody>
            </table>
        </div>
    )
}