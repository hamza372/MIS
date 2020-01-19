import React from 'react'
import moment from 'moment'
import calculateGrade from 'utils/calculateGrade'
import { PrintHeader } from 'components/Layout'

import './style.css'

type PropsType = {
    student: MISStudent
    settings: RootDBState["settings"]
    exams: RootDBState["exams"]
    sectionName: string
    logo: string
    grades: RootDBState["settings"]["exams"]["grades"]
    listBy: string
    examFilter: {
        exam_title: string
        month?: string
        year: string
    }
    styles?: {
        showBorder: boolean
        showProfile: boolean
        showAttendance: boolean
        showOverallRemarks: boolean
    }
}

const ResultCard = (props: PropsType) => {

    const { student, settings, exams, sectionName, logo, grades, listBy, examFilter } = props

	const { schoolSession } = settings

    const formatNumber = (val: number): string | number => {
        return Number.isInteger(val) ? val : val.toFixed(2)
    }

    const getRemarks = (remarks: string, grade: string) => {
        
        if(remarks !== "") {
			return remarks
		}

		return grade && grades && grades[grade] ? grades[grade].remarks : ""
	}

	const calculateAttendace = (student: MISStudent) => {

		const attendance = student.attendance || {}

		let attendance_status_count = { PRESENT: 0, LEAVE: 0, ABSENT: 0, SICK_LEAVE: 0, SHORT_LEAVE: 0, CASUAL_LEAVE: 0 }

		for (const [date, record] of Object.entries(attendance)) {
			
			if(moment(date).isBetween(moment(schoolSession.start_date), moment(schoolSession.end_date))) {
				attendance_status_count[record.status] += 1
			}
		}

		return attendance_status_count
	}

	const { total_marks, marks_obtained } = Object.keys(student.exams || {})
		.filter(exam_id => exams[exam_id])
		.map(exam_id => exams[exam_id])
        .filter(exam => moment(exam.date).format("YYYY") === examFilter.year &&
            exam.name === examFilter.exam_title &&
            student.exams[exam.id].grade !== "Absent")
		.reduce((agg, curr) => ({
			total_marks: agg.total_marks + parseFloat(curr.total_score.toString()) || 0,
			marks_obtained: agg.marks_obtained + parseFloat(student.exams[curr.id].score.toString()) || 0
        }), { total_marks: 0, marks_obtained: 0 })
        
    const attendance = calculateAttendace(student)

    const total_leave_days = attendance.LEAVE + attendance.SHORT_LEAVE + attendance.SICK_LEAVE + attendance.CASUAL_LEAVE
    const total_attendance_days = attendance.ABSENT + attendance.PRESENT + total_leave_days
    
    const attendance_percentage = (attendance.PRESENT / total_attendance_days) * 100
    
    return(<div className="school-result-card" style={{width: "90%", margin: "auto"}}>
            
            <div className="school-header">
                <PrintHeader settings={settings} logo={logo}></PrintHeader>
            </div>
            <div className="exam-header" style={{border: "2px solid black", padding: "2px", fontWeight: "bold", margin: "5px 0px"}}>
                <div className="row" style={{justifyContent: "space-between", fontFamily: "serif"}}>
                    <div className="" style={{width: "40%"}}>Session: {moment(schoolSession.start_date).format("YYYY")} - {moment(schoolSession.end_date).format("YYYY")} </div>
                    <div className="" style={{width: "60%"}}>Exam Term: {examFilter.exam_title}</div>
                </div>
            </div>
            <div className="student-info-card" style={{fontFamily: "serif", margin: "20px 0px"}}>
                <div className="student-personal-info" style={{width: "70%"}}>
                    <div className="row">
                        <div style={{width: "25%"}}>Student Name:</div>
                        <div style={{textDecoration: "underline", fontWeight: "bold"}}>{student.Name}</div>
                    </div>
                    <div className="row">
                        <div style={{width: "25%"}}>Father Name:</div>
                        <div style={{textDecoration: "underline", fontWeight: "bold"}}>{student.ManName ? student.ManName : ""}</div>
                    </div>
                    <div className="row">
                        <div style={{width: "25%"}}>Admission No:</div>
                        <div style={{textDecoration: "underline", fontWeight: "bold"}}>{student.AdmissionNumber && student.AdmissionNumber !== "" ? student.AdmissionNumber : "" }</div>
                    </div>
                    <div className="row">
                        <div style={{width: "25%"}}>Date of Birth:</div>
                        <div style={{textDecoration: "underline", fontWeight: "bold"}}>{ student.Birthdate ? moment(student.Birthdate).format("DD/MM/YYYY") : "" }</div>
                    </div>
                    <div className="row">
                        <div style={{width: "25%"}}>Class-Section:</div>
                        <div style={{textDecoration: "underline", fontWeight: "bold"}}>{sectionName}</div>
                    </div>
                    <div className="row">
                        <div style={{width: "25%"}}>Attendance %:</div>
                        <div style={{fontWeight: "bold"}}>{formatNumber(attendance_percentage)}% (P: {attendance.PRESENT}, L: {total_leave_days}, A: {attendance.ABSENT})</div>
                    </div>
                </div>
                <div className="student-profile">
                    
                </div>
            </div>
            <div className="print-table" style={{height: "100mm"}}>
                <table>
                    <thead>
                        <tr style={{fontSize: "0.75rem", fontWeight: "bold"}}>
                            <th style={{width: "8%"}}>{listBy}</th>
                            <th>Subject</th>
                            <th style={{width: "12%"}}>Total Marks</th>
                            <th style={{width: "15%"}}>Marks Obtained</th>
                            <th style={{width: "12%"}}>Percentage</th>
                            <th style={{width: "8%"}}>Grade</th>
                            <th style={{width: "25%"}}>Remarks</th>
                        </tr>
                    </thead>
                    <tbody style={{fontSize: "0.75rem"}}>
                    {
                        Object.keys(student.exams || {})
                            .filter(exam_id => exams[exam_id])
                            .map(exam_id => exams[exam_id])
                            .filter(exam => moment(exam.date).format("YYYY") === examFilter.year && exam.name === examFilter.exam_title)
                            .sort((a, b) => examFilter.exam_title === "" ? (a.date - b.date) : a.subject.localeCompare(b.subject))
                            .map((exam, i) => <tr key={exam.id}>
                                    <td className="cell-center">{ listBy === "Date" ? moment(exam.date).format("MM/DD") : i + 1 }</td>
                                    <td>{exam.subject}</td>
                                    <td className="cell-center">{exam.total_score}</td>
                                    <td className="cell-center">{student.exams[exam.id].grade !== "Absent" ? student.exams[exam.id].score: "N/A"}</td>
                                    <td className="cell-center">{student.exams[exam.id].grade !== "Absent" ? (formatNumber(student.exams[exam.id].score / exam.total_score * 100)) : "N/A"}</td>
                                    <td className="cell-center">{student.exams[exam.id].grade}</td>
                                    <td>{getRemarks(student.exams[exam.id].remarks, student.exams[exam.id].grade)}</td>
                                </tr>)
                    }
                    </tbody>
                    <tfoot>
                        <tr style={{fontWeight: "bold", fontSize:"0.80rem"}}>
                            <td colSpan={2} className="cell-center">Grand Total</td>
                            <td className="cell-center">{total_marks}</td>
                            <td className="cell-center">{formatNumber(marks_obtained)}</td>
                            <td className="cell-center">{formatNumber(marks_obtained/total_marks * 100)}%</td>
                        </tr>
                    </tfoot>				
                </table>
                <div className="result-stats">
                    <div className="row">Grade: &nbsp; <b>{calculateGrade(marks_obtained, total_marks, grades)}</b></div>
                    <div className="row">Position: ________</div>
                </div>
            </div>
            <div className="" style={{marginTop: "45mm"}}>
				<div className="remarks">
					<div>Overall Remarks</div>
					<div>_____________________________________________________________________</div>
				</div>
				<div className="result-footer">
					<div className="left">
						<div> Teacher's Signature</div>
					</div>
					<div className="right">
						<div> Principal's Signature</div>
					</div>
				</div>
			</div>
        </div>
    );
}

export default ResultCard