import React from "react"
import toTitleCase from "utils/toTitleCase"
import QRCode from 'qrcode.react'
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

	return (<div className="student-card">
		<div className="card-row card-school-info">
			<img className="card-school-logo" src={schoolLogo} alt="School Logo" />
			<div className="card-school-title">{schoolName}</div>
		</div>
		<div className="card-row first">
			<div className={avatar ? "" : "card-student-profile"}>
				{
					avatar && <img
						src={avatar}
						crossOrigin="anonymous"
						style={{ height: 100, width: 100 }}
						alt="profile" />
				}
				<div className="card-signature" style={{ marginTop: avatar ? 18 : 122 }}>Issuing Authority</div>
			</div>
			<div className="card-student-info">
				<div style={{ fontSize: ".75rem" }}>
					<div>Name: <span>{toTitleCase(student.Name)}</span></div>
					<div>Class: <span className="name-wrap">{studentClass}</span></div>
					<div>Roll No: <span>{student.RollNumber}</span></div>
					<div>Valid for: <span>{schoolSession.startYear}-{schoolSession.endYear}</span></div>
				</div>
				<div style={{ marginLeft: 130 }}>
					<QRCode value={student.id} size={72} />
				</div>
			</div>
		</div>
	</div>);
}

export default StudentIDCard