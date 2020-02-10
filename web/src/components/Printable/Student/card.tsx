import React from "react"
import toTitleCase from "utils/toTitleCase"
import './style.css'

type PropsTypes = {
    student: MISStudent
    schoolName: string
    schoolLogo?: string
    schoolSession: {
        startYear: string
        endYear: string
    }
    studentClass?: string
}

const StudentIDCard = (props: PropsTypes) => {

    const { student, schoolName, schoolLogo, studentClass, schoolSession } = props

    const avatar = student.ProfilePicture ? student.ProfilePicture.url || student.ProfilePicture.image_string : ""

    return(<div className="student-card">  
        <div className="card-row card-school-info">
            <img className="card-school-logo" src={schoolLogo} alt="School Logo"/>
            <div className="card-school-title">{schoolName}</div>
        </div>
        <div className="card-row first">
            <div className={ avatar ? "" : "card-student-profile"}>
            { 
                avatar && <img 
                    src={avatar}
                    crossOrigin="anonymous"
                    style={{ height:100, width: 100 }}
                    alt="profile" />
            }
            </div>
            <div className="card-student-info">
                <div>Name: <span>{ toTitleCase(student.Name) }</span></div>
                <div>Class: <span>{ studentClass }</span></div>
                <div>Roll No: <span>{ student.RollNumber }</span></div>
            </div>
        </div>
        <div className="card-row last">
            <div className="card-column">
                <div className="card-signature">Issuing Authority</div>
            </div>
            <div className="card-column">
                <div className="card-valid-date">Valid { schoolSession.startYear }-{ schoolSession.endYear }</div>
            </div>
        </div>
    </div>);
}

export default StudentIDCard