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
    sectionTeacher: string
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

    const { student, settings, exams, sectionName, sectionTeacher, logo, grades, listBy, examFilter } = props

    const { schoolSession } = settings
    
    const avatar = student.ProfilePicture ? (student.ProfilePicture.url || student.ProfilePicture.image_string) : undefined

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
    
    return(<div className="school-result-card">
            <div className="school-header" style={{maxHeight: "40mm"}}>
                <PrintHeader settings={settings} logo={logo}></PrintHeader>
            </div>
            <div className="no-print" style={{marginBottom: "20mm"}}/>
            <div className="result-card-header">
                <div className="row">
                    <div className="school-session"> Session: {moment(schoolSession.start_date).format("YYYY")} - {moment(schoolSession.end_date).format("YYYY")} </div>
                    <div className="exam-title">Exam Term: {examFilter.exam_title}</div>
                </div>
            </div>
            <div className="student-info-card">
                <div className="student-info">
                    <div className="row">
                        <div className="label">Student Name:</div>
                        <div className="bold text-underline">{student.Name}</div>
                    </div>
                    <div className="row">
                        <div className="label">Father Name:</div>
                        <div className="bold text-underline">{student.ManName ? student.ManName : ""}</div>
                    </div>
                    <div className="row">
                        <div className="label">Admission No:</div>
                        <div className="bold text-underline">{student.AdmissionNumber && student.AdmissionNumber !== "" ? student.AdmissionNumber : "" }</div>
                    </div>
                    <div className="row">
                        <div className="label">Date of Birth:</div>
                        <div className="bold text-underline">{ student.Birthdate ? moment(student.Birthdate).format("DD/MM/YYYY") : "" }</div>
                    </div>
                    <div className="row">
                        <div className="label">Class-Section:</div>
                        <div className="bold text-underline">{sectionName}</div>
                    </div>
                    <div className="row">
                        <div className="label">Class Teacher:</div>
                        <div className="bold text-underline">{sectionTeacher}</div>
                    </div>
                    <div className="row">
                        <div className="label">Attendance %:</div>
                        <div className="bold">{formatNumber(attendance_percentage)}% (P: {attendance.PRESENT}, L: {total_leave_days}, A: {attendance.ABSENT})</div>
                    </div>
                </div>
                <div className="student-profile">
                    { avatar && <img
                        src={avatar}
                        crossOrigin="anonymous"
                        style={{height: 100, width: 100}}
                        alt="profile"/>
                    }
                </div>
            </div>
            <div className="print-table" style={{height: "100mm"}}>
                <table>
                    <thead>
                        <tr className="bold">
                            <th className="cell-listby">{listBy}</th>
                            <th className="cell-subject">Subjects</th>
                            <th className="cell-tmarks">Total Marks</th>
                            <th className="cell-omarks">Marks Obtained</th>
                            <th className="cell-percentage">Percentage</th>
                            <th className="cell-grade">Grade</th>
                            <th className="cell-remarks">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        Object.keys(student.exams || {})
                            .filter(exam_id => exams[exam_id])
                            .map(exam_id => exams[exam_id])
                            .filter(exam => moment(exam.date).format("YYYY") === examFilter.year && exam.name === examFilter.exam_title)
                            .sort((a, b) => examFilter.exam_title === "" ? (a.date - b.date) : a.subject.localeCompare(b.subject))
                            .map((exam, i) => <tr key={exam.id}>
                                    <td className="text-center">{ listBy === "Date" ? moment(exam.date).format("MM/DD") : i + 1 }</td>
                                    <td>{exam.subject}</td>
                                    <td className="text-center">{exam.total_score}</td>
                                    <td className="text-center">{student.exams[exam.id].grade !== "Absent" ? student.exams[exam.id].score: "N/A"}</td>
                                    <td className="text-center">{student.exams[exam.id].grade !== "Absent" ? (formatNumber(student.exams[exam.id].score / exam.total_score * 100)) : "N/A"}</td>
                                    <td className="text-center">{student.exams[exam.id].grade}</td>
                                    <td>{getRemarks(student.exams[exam.id].remarks, student.exams[exam.id].grade)}</td>
                                </tr>)
                    }
                    </tbody>
                    <tfoot>
                        <tr className="bold" style={{height: 0.8}}>
                            <td colSpan={2} className="text-center">Grand Total</td>
                            <td className="text-center">{total_marks}</td>
                            <td className="text-center">{formatNumber(marks_obtained)}</td>
                            <td className="text-center">{formatNumber(marks_obtained/total_marks * 100)}%</td>
                            <td colSpan={2}></td>
                        </tr>
                    </tfoot>				
                </table>
                <div className="result-stats">
                    <div className="row">Grade: &nbsp; <b>{calculateGrade(marks_obtained, total_marks, grades)}</b></div>
                    <div className="row">Position: ________</div>
                </div>
            </div>
            <div className="print-only" style={{marginTop: "45mm"}}>
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