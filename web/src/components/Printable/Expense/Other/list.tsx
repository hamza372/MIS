import React from "react"
import "../../print.css"
import moment from "moment"

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
                    <td className="cell-center">{moment(exp.date).format(dateView)}</td>
					<td> {exp.label}</td>
					<td> {exp.category}</td>
					<td className="cell-center"> {exp.quantity} {exp.quantity !== 1 ? "Entries" : "Entry"}</td>
					<td className="cell-center"> {exp.amount}</td>
                    </tr>)
                }
                </tbody>
            </table>
        </div>
    )
}