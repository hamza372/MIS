import React from "react"
import toTitleCase from "utils/toTitleCase"

import "./../print.css"

type PropsTypes = {
	chunkSize: number
	students_class: MISClass
	schoolName: string
	items: GraphData[]
}

type GraphData = {
	total_marks: number
	marks_obtained: number
	percentage: number
} & StudentMarksSheet

export const StudentsPerformanceList = (props: PropsTypes) => {

	return (
		<div className="print-only print-table">
			<table>
				<caption>
					<div className="text-uppercase">{props.schoolName || ""}</div>
					<div>Students Performance List <b>{props.students_class ? props.students_class.name : ''}</b></div>
				</caption>
				<thead>
					<tr>
						<th className="row-sr">Sr #</th>
						<th className="row-name">Name</th>
						<th className="row-name">Father Name</th>
						<th className="row-roll">Roll #</th>
						<th className="row-marks">Marks</th>
						<th className="row-marks">Percentage</th>
						<th className="row-grade">Grade</th>
					</tr>
				</thead>
				<tbody>
					{
						props.items.map((item: GraphData, i: number) => <tr key={item.id}>
							<td className="cell-center">{i + props.chunkSize + 1}</td>
							<td>{toTitleCase(item.name)}</td>
							<td>{item.manName}</td>
							<td className="cell-center">{item.rollNo}</td>
							<td className="cell-center">{item.marks_obtained}/{item.total_marks}</td>
							<td className="cell-center">{item.percentage}%</td>
							<td className="cell-center">{item.grade}</td>
						</tr>)
					}
				</tbody>
			</table>
		</div>
	)
}