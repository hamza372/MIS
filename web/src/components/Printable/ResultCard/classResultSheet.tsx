import React from "react"
import moment from "moment"
import toTitleCase from "utils/toTitleCase"

import "./../print.css"

type PropsTypes = {
	students: StudentMarksSheet[]
	relevant_exams: MISExam[]
	chunkSize: number
	sectionName: string
	examName: string
	schoolName: string
}

export const ClassResultSheet = (props: PropsTypes) => {

	// 70% is the remaining width for dynamic section subjects
	// tested with 9 subjects, output is fine
	const widthForSubjectName = 70 / Object.keys(props.relevant_exams).length
	const formatMarks = (marks_obtained: number): string => {
		// if a number is decimal, fix it to only 2 decimal positions
		return Number.isInteger(marks_obtained) ? marks_obtained.toString() : marks_obtained.toFixed(2)
	}

	return (
		<div className="print-table print-page">
			<table className="outer-space">
				<caption>
					<div>{props.schoolName ? props.schoolName.toUpperCase() : ""}</div>
					<div>Class: {props.sectionName} | Exam: {props.examName} - {moment().format('YYYY')}</div>
				</caption>
				<thead>
					<tr>
						<th className="result-sheet" style={{ width: "4%" }}>R No.</th>
						<th className="result-sheet" style={{ width: "15%" }}>Name</th>
						{
							props.relevant_exams
								.sort((a, b) => a.date - b.date)
								.map((exam, index) => {
									return <th
										key={index}
										className="result-sheet"
										style={{ width: `${widthForSubjectName}}%`, lineHeight: 1 }}>
										{exam.subject} <br /> ( {exam.total_score} ) </th>
								})
						}
						<th className="result-sheet row-marks">Obt./total</th>
						<th className="result-sheet row-grade">Grade</th>
					</tr>
				</thead>
				<tbody>
					{
						props.students
							.map((student: StudentMarksSheet, index) => {
								return <tr key={index}>
									<td>{student.rollNo || ''}</td>
									<td>{toTitleCase(student.name)}</td>
									{
										props.relevant_exams
											.sort((a, b) => a.date - b.date)
											.map(exam => {
												const aug_exam = student.merge_exams.find(x => x.id === exam.id)
												if (aug_exam === undefined) {
													return <td key={exam.id} className="cell-center">-</td>
												}

												return <td key={aug_exam.id} className="cell-center"> {aug_exam.stats.score || 0} </td>
											})
									}
									<td className="cell-center">{`${formatMarks(student.marks.obtained)}/${student.marks.total}`}</td>
									<td className="cell-center">{student.grade}</td>
								</tr>
							})
					}
				</tbody>
			</table>
		</div>
	)
}