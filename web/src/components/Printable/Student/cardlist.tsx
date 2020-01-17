import React from "react"
import StudentIDCard from "./card"

import "./../print.css"
import "./style.css"

type PropsTypes = {
  students: MISStudent[]
  schoolName: string
  schoolLogo: string
  studentClass: string
}

export const StudenPrintableIDCardList = (props: PropsTypes) => {
  const students = props.studentClass !== "" ?
    props.students.sort((a, b) => (parseInt(a.RollNumber) || 0) - (parseInt(b.RollNumber) || 0)) :
    props.students

  return (
    <div className="student-id-card print-only print-table" style={{ width: "90%" }}>
      <table>
        <caption>
            <div className="text-uppercase">{ props.schoolName ? props.schoolName : "" }</div>
            <div>Students Cards for { props.studentClass }</div>
        </caption>
        <tbody>
            <div className="card-grid">
              {
                students.map(student => ( <StudentIDCard key={ student.id }
                      student={ student }
                      schoolName={ props.schoolName }
                      studentClass={ props.studentClass }
                      schoolLogo={ props.schoolLogo }/>))
              }
            </div>
        </tbody>
      </table>
    </div>)
}