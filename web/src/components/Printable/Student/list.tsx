import React from "react"
import "./../print.css"

type PropsTypes = {
    students: MISStudent[]
    chunkSize: number
    schoolName: string
}

export const StudentPrintableList = (props: PropsTypes) => {

    return (
        <div className="print-only print-table" style={{width: "90%"}}>
            <table>
                <caption>
                    <div>{ props.schoolName ? props.schoolName.toUpperCase() : "" }</div>
                    <div>Student List</div>
                </caption>
                <thead>
                    <tr>
                        <th className="row-sr">Sr #</th>
                        <th className="row-name">Name</th>
                        <th className="row-fname">Father Name</th>
                        <th className="row-roll">Roll #</th>
                        <th className="row-phone">Phone #</th>
                    </tr>
                </thead>
                <tbody>
                   {
                       props.students.map((student: MISStudent, i) => <tr key={student.id}>
                            <td style={{textAlign: "center"}}>{i + props.chunkSize + 1}</td>
                            <td>{student.Name}</td>
                            <td>{student.ManName}</td>
                            <td style={{textAlign: "center"}}>{student.RollNumber}</td>
                            <td>{student.Phone}</td>     
                        </tr>)
                   }
                </tbody>
            </table>
        </div>
    )
}