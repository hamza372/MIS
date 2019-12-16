import React from "react"
import "./../print.css"
import moment from "moment"

type studentMarks = {
    id: string
    name: string
    roll: string
    marks: { obtained: number, total: number}
    grade: string
    exams: Exams[]
}

type Exams = MISExam & {
    stats: {
        score: number 
        remarks: string
        grade: string
    }
}

type PropsTypes = {
    students: studentMarks[]
    examSubjectsWithMarks: Set<string>
    chunkSize: number
    sectionName: string
    examName: string
    schoolName: string
}

export const ClassResultSheet = (props: PropsTypes) => {
    
    // 66% is the remaining width for dynamic section subjects
    // tested with 9 subjects, output is fine
    const widthForSubjectName = 66 / props.examSubjectsWithMarks.size
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
                        <th className="result-sheet" style={{width: "4%"}}>Sr No.</th>
                        <th className="result-sheet" style={{width: "15%"}}>Name</th>
                        {
                            Array.from(props.examSubjectsWithMarks)
								.map((subject, index) => <th className="result-sheet" style={{width: `${widthForSubjectName}}%`}} key={index}> {subject} </th>)
                        }
                        <th className="result-sheet row-marks">Obt./total</th>
                        <th className="result-sheet row-grade">Grade</th>
                    </tr>
                </thead>
                <tbody>
                   {
                    props.students
                        .map((student, index) => {
                            return <tr key={index}>
                                <td>{props.chunkSize + index + 1}</td>
                                <td>{student.name}</td>
                                {
                                    student.exams.map((exam, i) => <td key={i} className="cell-center"> {exam.stats ? exam.stats.score : 0 } </td>)
                                }
                                <td className="cell-center">{`${ formatMarks(student.marks.obtained) }/${ student.marks.total }`}</td>
                                <td>{ student.grade }</td>
                        </tr>})
                    }
                </tbody>
            </table>
        </div>
    )
}