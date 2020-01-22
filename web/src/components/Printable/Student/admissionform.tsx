import React from 'react'
import moment from 'moment'
import getSectionFromId from 'utils/getSectionFromId'

type PropsType = {
    student: MISStudent
    classes: RootDBState['classes']
    school: {
        name: string
        code: string
        logo: string
        phone: string
        address: string
    }
}


const AdmissionForm = (props: PropsType) => {
    
    const { student, classes, school } = props

    const avatar = student.ProfilePicture ? (student.ProfilePicture.url || student.ProfilePicture.image_string) : undefined
    const section = getSectionFromId(student.section_id, classes)

    return(<div className="print-only admission-form">
            <div className="header-section">
                <div className="header-body">
                    <div className="logo-container">
                        {school.logo !== "" && <img className="header-logo" src={school.logo} alt="School Logo"/>}
                    </div>
                    <div className="header-style">
                        <div className="title school-title">{school.name || ""}</div>
                        <div className="address">{school.address || ""}</div>
                        <div className="phone-number"> Tel: {school.phone || ""}</div>
                        {school.code && <div className="school-code"> School Code: {school.code || "_______"} </div>}
                    </div>
                </div>
            </div>
            <div className="admission-title title">Admission Form </div>
            <fieldset>
                <legend>Student Personal Information</legend>
                <div className="student-info-card">
                    <div className="student-info">
                        <div className="row" style={{marginTop: "5mm"}}>
                            <label>Full Name:</label>
                            <div>{student.Name}</div>
                        </div>
                        <div className="row">
                            <label>Form (B) No:</label>
                            <div>{student.BForm}</div>
                        </div>
                        <div className="row">
                            <label>Date of Birth:</label>
                            <div>{student.Birthdate ? moment(student.Birthdate).format("DD, MMMM YYYY") : ""}</div>
                        </div>
                        <div className="row" style={{marginBottom: "2.5mm"}}>
                            <label>Gender:</label>
                            <div className="gender">
                                <input type="checkbox" checked={student.Gender === "male"}/><span>Male</span>
                                <input type="checkbox" checked={student.Gender === "female"}/><span>Female</span>
                            </div>
                        </div>
                        <div className="row">
                            <label>Blood Type:</label>
                            <div>{student.BloodType}</div>
                        </div>
                    </div>
                    <div className="profile-picture" style={{border: avatar ? "none" : "1px solid black"}}>
                        { avatar && <img
                            src={avatar}
                            crossOrigin="anonymous"
                            style={{height: 100, width: 100}}
                            alt="student-profile" />
                        }
                    </div>
                </div>
            </fieldset>
            <fieldset style={{marginTop: 5}}>
                <legend>Family &amp; Contact Information</legend>
                <div className="row" style={{marginTop: "5mm"}}>
                    <label>Family Code:</label>
                    <div>{student.FamilyID || ""}</div>
                </div>
                <div className="row">
                    <label>Father/Guardian Name:</label>
                    <div>{student.ManName || ""}</div>
                </div>
                <div className="row">
                    <label>Father/Guardian CNIC:</label>
                    <div>{student.ManCNIC || ""}</div>
                </div>
                <div className="row">
                    <label>Phone No:</label>
                    <div>{student.Phone || ""}</div>
                </div>
                <div className="row">
                    <label>Home Address:</label>
                    <div>{student.Address || ""}</div>
                </div>
                <div className="row">
                    <label>&nbsp;</label>
                    <div/>
                </div>
            </fieldset>
            <fieldset style={{marginTop: 5}}>
                <legend>For Office Use Only</legend>
                <div className="row" style={{marginTop: "5mm"}}>
                    <label>Admission Date:</label>
                    <div>{student.StartDate ? moment(student.StartDate).format("DD, MMMM YYYY") : ""}</div>
                </div>
                <div className="row">
                    <label>Admission No:</label>
                    <div>{student.AdmissionNumber || ""}</div>
                </div>
                <div className="row">
                    <label>Class-Section:</label>
                    <div>{section && section.namespaced_name ? section.namespaced_name : ""}</div>
                </div>
                <div className="row">
                    <label>Roll No:</label>
                    <div>{student.RollNumber || ""}</div>
                </div>
                <div className="row">
                    <label>Student's Status</label>
                    <div>{student.Active ? "Student Currently goes to this School" : "Student No Longer goes to this School"}</div>
                </div>
                <div className="row">
                    <label>Other</label>
                    <div/>
                </div>
            </fieldset>
            <div className="row signature-section">
                <div className="left">
                    <div>Father/Guardian's Signature</div>
                </div>
                <div className="right">
                    <div>Principal's Signature</div>
                </div>
            </div>
        </div>);
}

export default AdmissionForm