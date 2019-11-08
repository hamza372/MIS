import React from "react"
import "../../print.css"
import moment from "moment"

type PropsTypes = {
    items: any
    chunkSize: number
    schoolName: string
}

export const IncomeExpenditurePrintableList = (props: PropsTypes) => {
    return (
        <div className="print-only print-table">
            <table>
                <caption>
                    <div>{ props.schoolName ? props.schoolName.toUpperCase() : "" }</div>
                    <div>Income-Expenditure List</div>
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
                    props.items.map(([id, exp]: any, i: number) => <tr key={id}>
                    <td>{moment(exp.date).format("DD-MM-YYYY")}</td>
                    <td> { exp.type === "PAYMENT_GIVEN" ? exp.td : exp.type === "SUBMITTED" ? "PAID": "-" }</td>
                    <td> { exp.type === "PAYMENT_GIVEN" ? exp.category : exp.type === "SUBMITTED" && exp.fee_name !== undefined ? exp.fee_name : "-"}</td>
                    <td> { exp.type === "PAYMENT_GIVEN" ? exp.expense === "MIS_EXPENSE" && exp.quantity : "1"} </td>
                    <td> { exp.type === "PAYMENT_GIVEN" ? -1 * (exp.amount - (exp.expense === "SALARY_EXPENSE" ? exp.deduction : 0)) : exp.amount}</td>
                    </tr>)
                    
                }
                </tbody>
            </table>
        </div>
    )
}