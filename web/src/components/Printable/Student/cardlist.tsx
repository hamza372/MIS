import React from "react"
import StudentIDCard from "./card"

import "./../print.css"
import "./style.css"

type PropsTypes = {
	students: AugmentedStudent[]
	schoolName: string
	schoolLogo: string
	schoolSession: {
		startYear: string
		endYear: string
	}
	studentClass: string
}

export const StudenPrintableIDCardList = (props: PropsTypes) => {

	const { students, studentClass, schoolName, schoolLogo, schoolSession } = props

	const sorted_students = studentClass !== "" ?
		students.sort((a, b) => (parseInt(a.RollNumber) || 0) - (parseInt(b.RollNumber) || 0)) :
		students

	return (
		<div className="student-id-card print-only print-table" style={{ width: "90%", margin: "auto" }}>
			<table>
				<tbody>
					<div className="card-grid">
						{
							sorted_students.map(student => (<StudentIDCard key={student.id}
								student={student}
								schoolName={schoolName}
								studentClass={student.section && student.section.namespaced_name ? student.section.namespaced_name : ""}
								schoolLogo={schoolLogo}
								schoolSession={schoolSession} />))
						}
					</div>
				</tbody>
			</table>
		</div>)
}