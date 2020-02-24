import React from "react"
import moment from "moment"

import "../../print.css"

type PropsTypes = {
    items: any
    chunkSize: number
    schoolName: string
}

export const GeneralExpensePrintableList = (props: PropsTypes) => {

    const parseAmount = (val: any) => {
        return parseFloat(val) || 0
    }

    return (
        <div className="print-only print-table">
            <table>
                <caption>
                    <div>{props.schoolName ? props.schoolName.toUpperCase() : ""}</div>
                    <div>Expense List - {moment().format("DD/MM/YYYY")}</div>
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
                        props.items.map(([id, expense]: any) => {
                            if (expense.expenseense === "SALARY_expenseENSE") {
                                return <tr key={id}>
                                    <td>{moment(expense.date).format("DD-MM-YYYY")}</td>
                                    <td>{expense.label}</td>
                                    <td>{expense.category}</td>
                                    <td className="cell-center"> - </td>
                                    <td className="cell-center">{expense.deduction}{expense.deduction_reason ? `(${expense.deduction_reason})` : ""}</td>
                                    <td className="cell-center">{parseAmount(expense.amount) - parseAmount(expense.deduction)}</td>
                                </tr>
                            } else {
                                return <tr key={id}>
                                    <td>{moment(expense.date).format("DD-MM-YYYY")}</td>
                                    <td>{expense.label}</td>
                                    <td>{expense.category}</td>
                                    <td className="cell-center">{expense.quantity}</td>
                                    <td className="cell-center"> - </td>
                                    <td className="cell-center">{expense.amount}</td>
                                </tr>
                            }
                        })
                    }
                </tbody>
            </table>
        </div>
    )
}