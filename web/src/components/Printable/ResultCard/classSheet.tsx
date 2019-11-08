import React from "react"
import "./../print.css"
import "./style.css"

type studentMarksMap = {
    [id: string] : {
        name: string
        subjects: subjectItem[]
        total: number
        obtained: number
        grade: string
        examTitle: string
        examYear: string
    }
}

type subjectItem = {
    [id: string]: number
}

type PropsTypes = {
    students: studentMarksMap[]
    chunkSize: number
    sectionName: string
    schoolName: string
}

export const ClassResultSheet = (props: PropsTypes) => {

    return (
        <div className="print-only">
            <table>
                <caption>
                    <div>{ props.schoolName ? props.schoolName.toUpperCase() : "" }</div>
                    <div>Class/Section - {props.sectionName}</div>
                    <div>Exam { }</div>
                </caption>
                <thead>
                    <tr>
                        <th className="row-rollno">Roll No.</th>
                        <th className="row-name">Name</th>
                        {
                            // subjects name would rendered here
                        }
                        <th className="row-marks">Obt./total</th>
                        <th className="row-grade">Grade</th>
                    </tr>
                </thead>
                <tbody>
                   {
                        // studentMarksMap[] would rendered here
                   }
                </tbody>
            </table>
        </div>
    )
}