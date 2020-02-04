import React from "react"
import moment from "moment"
import toTitleCase from "utils/toTitleCase"

import "./../print.css"

type PropsTypes = {
    students: StudentMarksSheet[]
    examSubjectsWithMarks: Set<string>
    chunkSize: number
    sectionName: string
    examName: string
    schoolName: string
}

export const ClassResultSheet = (props: PropsTypes) => {
    
    // 70% is the remaining width for dynamic section subjects
    // tested with 9 subjects, output is fine
    const widthForSubjectName = 70 / props.examSubjectsWithMarks.size
    const formatMarks = (marks_obtained: number) => {
        // if a number is decimal, fix it to only 2 decimal positions
        return marks_obtained % 1 === 0 ? marks_obtained : marks_obtained.toFixed(2)
    }

    return (
        <div className="print-table print-page">
            <table className="outer-space">
                <caption>
                    <div>{ props.schoolName ? props.schoolName.toUpperCase() : "" }</div>
                    <div>Class: {props.sectionName} | Exam: { props.examName } - {moment().format('YYYY')}</div>
                </caption>
                <thead>
                    <tr>
                        <th className="result-sheet" style={{width: "4%"}}>R No.</th>
                        <th className="result-sheet" style={{width: "15%"}}>Name</th>
                        {
                            Array.from(props.examSubjectsWithMarks)
                                .sort((a, b) => a.localeCompare(b))
                                .map((subject, index) => <th 
                                    key={index}
                                    className="result-sheet"
                                    style={{width: `${widthForSubjectName}}%`, lineHeight: 1}}> 
                                    {subject.substr(0, subject.indexOf('('))} <br/> {subject.substr(subject.indexOf('('))}</th>)
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
                                    student.exams
                                        .sort((a, b) => a.subject.localeCompare(b.subject))
                                        .map((exam, i) => <td key={i} className="cell-center"> {exam.stats ? exam.stats.score : 0 } </td>)
                                }
                                <td className="cell-center">{`${ formatMarks(student.marks.obtained) }/${ student.marks.total }`}</td>
                                <td className="cell-center">{ student.grade }</td>
                        </tr>})
                    }
                </tbody>
            </table>
        </div>
    )
}