import React, { Component } from 'react'
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';

import Former from '../../../../utils/former';
import { PrintHeader } from '../../../../components/Layout';
import { capitalize } from '../../../../utils/capitalize'
import { getGenderSpecificText } from '../../../../utils/getGenderSpecificText'
import moment from 'moment';

interface P {
	students: RootDBState['students']
	teachers: RootDBState["faculty"]
	settings: RootDBState["settings"]
	schoolLogo: RootDBState["assets"]["schoolLogo"]
}

interface S {
	selectedCertificate: string
}

interface RouteInfo {
	id: string
}

type propTypes = RouteComponentProps < RouteInfo > & P

class TeacherCertificates extends Component < propTypes, S > {

	former: Former
	constructor(props: propTypes) {
		super(props)

		this.state = {
			selectedCertificate: "EXPERIENCE"
		}
		this.former = new Former( this, [] )
	}

	teacher = () : MISTeacher => {
		const id = this.props.match.params.id
		return this.props.teachers[id]
	}

	getSelectedCertificate = () => {
		switch(this.state.selectedCertificate){
			case "EXPERIENCE":
				return <ExperienceCertificate curr_teacher={this.teacher()} />
			case "PERFORMANCE":
				return <PerformanceCertificate curr_teacher={this.teacher()}/>
		}
	}

	render() {
		const {settings, schoolLogo} = this.props

		return (
			<div className="certificate">
				<PrintHeader settings={settings} logo={schoolLogo} />

					<div className="divider no-print">Certificates</div>

					<div className="cert-Info no-print">
						<div className="row">
							<label>Type</label>
							<select {...this.former.super_handle(["selectedCertificate"])}>
								<option value="EXPERIENCE">Experience</option>
								<option value="PERFORMANCE">Performance</option>
							</select>
						</div>
						<div className="button blue" onClick={()=> window.print()}>Print</div>
					</div>
					{this.getSelectedCertificate()}
			</div>
		)
	}
}

export default connect ((state : RootReducerState) => ({
	students: state.db.students,
	teachers: state.db.faculty,
	settings: state.db.settings,
	schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : ""
}))(TeacherCertificates)

interface CertificateProps {
	curr_teacher: MISTeacher
}


const ExperienceCertificate: React.FC <CertificateProps> = ({ curr_teacher }) => {

	const curr_date : number = new Date().getTime()
	const gender = curr_teacher.Gender

	return <div className="certificate-page">

		<div className="head">
			<div className="divider">EXPERIENCE CERTIFICATE</div>
			<div className="sub-divider"> To Whom it May Concern</div>
		</div>

		<div className="body">
			<div className="para" contentEditable={true}>
				This is to certify that <span className="emphasize">{curr_teacher.Name}</span>, 
				{` ${getGenderSpecificText("son/daughter", gender)}`} of <span className="emphasize">{curr_teacher.ManName ? curr_teacher.ManName : "________________"}</span>, has
				worked as a teacher of the following subjects in our school from <b style={{textDecoration:"underline"}}>{`${moment(curr_teacher.HireDate).format("DD-MM-YYYY")} `}</b>
				to <b style={{textDecoration:"underline"}}>{moment(curr_date).format("DD-MM-YYYY")} </b>
			</div>

			<div className="cert-row" contentEditable={true}>
				<label>Subjects: </label>
				<div/>
			</div>

			<div className="cert-row" contentEditable={true}>
				<label>Class: </label>
				<div/>
			</div>

			<div className="cert-row" contentEditable={true}>
				<label>Remarks: </label>
				<div/>
			</div>

			<div className="para" contentEditable={true}>
			We found {getGenderSpecificText("him/her", gender)} responsible, enthusiastic and hardworking during {getGenderSpecificText("his/her", gender)} tenure. {capitalize(getGenderSpecificText("he/she", gender))} can prove to be an asset for any organization. We wish {getGenderSpecificText("him/her", gender)} success in {`${getGenderSpecificText("his/her", gender)} `} 
			future endeavours.
			</div>

		</div>

		<div className="footer">
			<div className="left">
				<div> Issuance Date</div>
			</div>
			<div className="right">
				<div> Principal Signature</div>
			</div>
		</div>
	</div>
}

const PerformanceCertificate: React.FC <CertificateProps> = ({ curr_teacher }) => {

	const curr_date : number = new Date().getTime()
	const gender = curr_teacher.Gender

	return <div className="certificate-page">

		<div className="head">
			<div className="divider">PERFORMANCE CERTIFICATE</div>
			<div className="sub-divider"> To Whom it May Concern</div>
		</div>

		<div className="body">
			<div className="para" contentEditable={true}>
				This certificate is awarded to <span className="emphasize">{curr_teacher.Name}</span>, 
				{` ${getGenderSpecificText("son/daughter", gender)}`} of <span className="emphasize">{curr_teacher.ManName ? curr_teacher.ManName : "________________"}</span> to acknowledge {`${getGenderSpecificText("his/her", gender)} `}
				outstanding performance in his work as the teacher of the following subjects in our school.
			</div>

			<div className="cert-row" contentEditable={true}>
				<label>Subjects: </label>
				<div/>
			</div>

			<div className="cert-row" contentEditable={true}>
				<label>Class: </label>
				<div/>
			</div>

			<div className="cert-row" contentEditable={true}>
				<label>Remarks: </label>
				<div/>
			</div>

			<div className="para" contentEditable={true}>
			We found {getGenderSpecificText("him/her", gender)} responsible, enthusiastic and hardworking and we hope {getGenderSpecificText("he/she", gender)} will keep up this good work during {getGenderSpecificText("his/her", gender)} tenure. 
			</div>

		</div>

		<div className="footer">
			<div className="left">
				<div> Issuance Date</div>
			</div>
			<div className="right">
				<div> Principal Signature</div>
			</div>
		</div>
	</div>
}
