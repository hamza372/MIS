import React from "react"
import "./../print.css"
import moment from "moment"

type PropsTypes = {
    students: AugmentedStudent[]
    chunkSize: number
    schoolName: string
    studentClass: string
}

type AugmentedStudent = MISStudent & { section: AugmentedSection }

export const StudentPrintableList = (props: PropsTypes) => {
    const students = props.studentClass !== "" ? 
        props.students.sort((a, b) => (parseInt(a.RollNumber) || 0) - (parseInt(b.RollNumber) || 0)) : 
        props.students
    
    return (
        <div className="print-only print-table student-info-list" style={{width: "95%"}}>
            <table>
                <caption>   
                    <div>{ props.schoolName ? props.schoolName.toUpperCase() : "" } - Students List { props.studentClass }</div>
                </caption>
                <thead>
                    <tr>
                        <th className="row-sr">Sr #</th>
                        <th className="row-name">Name</th>
                        <th className="row-fname">Father Name</th>
                        <th className="row-dob">DOB</th>
                        <th className="row-adm-date">Adm. Date</th>
                        <th className="row-adm">Adm #</th>
                        <th className="row-class">Class</th>
                        <th className="row-roll">Roll #</th>
                        <th className="row-phone">Phone #</th>
                    </tr>
                </thead>
                <tbody>
                   {
                       students.map((student: AugmentedStudent, i) => <tr key={student.id}>
                            <td className="cell-center">{i + props.chunkSize + 1}</td>
                            <td>{student.Name}</td>
                            <td>{student.ManName}</td>
                            <td className="cell-center">{student.Birthdate ? moment(student.Birthdate).format("DD-MM-YYYY") : '-'}</td>
                            <td className="cell-center">{student.StartDate ? moment(student.StartDate).format("DD-MM-YYYY") : '-'}</td>
                            <td className="cell-center">{student.AdmissionNumber}</td>
                            <td>{student.section && student.section.namespaced_name ? student.section.namespaced_name : -""}</td>
                            <td className="cell-center">{student.RollNumber}</td>
                            <td className="cell-center">{student.Phone}</td>
                        </tr>)
                   }
                </tbody>
            </table>
        </div>
    )
}