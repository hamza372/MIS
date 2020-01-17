import React from "react"
import './style.css'
import moment from "moment";

type PropsTypes = {
    student: MISStudent
    schoolName: string
    schoolLogo?: string
    studentClass?: string
} 

const StudentIDCard = (props: PropsTypes) => {
    return(<div className="student-card">  
        <div className="card-row card-school-info">
            <img className="card-school-logo" src={props.schoolLogo} alt="School Logo"/>
            <div className="card-school-title">{props.schoolName}</div>
        </div>
        <div className="card-row first">
            <div className="card-student-profile">
                <img src="" alt="profile"/>
            </div>
            <div className="card-student-info">
                <div>Name: <span>{ props.student.Name }</span></div>
                <div>Class: <span>{ props.studentClass }</span></div>
                <div>Roll No: <span>{ props.student.RollNumber }</span></div>
            </div>
        </div>
        <div className="card-row last">
            <div className="card-column">
                <div className="card-signature">Issuing Authority</div>
            </div>
            <div className="card-column">
                <div className="card-valid-date">Valid { moment().format("YYYY") }-{ moment().add(1, "year").format("YYYY") }</div>
            </div>
        </div>
    </div>);
}

export default StudentIDCard