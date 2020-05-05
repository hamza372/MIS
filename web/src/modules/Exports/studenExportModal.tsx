import React, { useState } from 'react'
import moment from 'moment'

import { downloadAsCSV } from 'utils/downloadCSV'

import './style.css'

const CSVHeaders = [
	"Name",
	"BForm",
	"Gender",
	"Phone",
	"Active",
	"FatherName",
	"FatherCNIC",
	"Birthdate",
	"Address",
	"StartDate",
	"AdmissionNumber",
	"AlternatePhone",
	"BloodType",
	"Religion"
]

type PropsType = {
	students: AugmentedStudent[]
	sections?: AugmentedSection[]
	onClose: () => void
}

const StudentExportModal: React.FC<PropsType> = ({ students, sections, onClose }) => {


	const [sectionID, setSectionID] = useState("")


	const generateCSV = () => {

		// for filename
		let section_name = sectionID ? sections.find(section => section.id === sectionID).namespaced_name : "all_classes"

		const csv_data = students
			.filter(student => {
				return sectionID ? sectionID === student.section_id : true
			})
			.reduce((agg, curr) => {
				return [
					...agg,
					{
						Name: curr.Name,
						BForm: curr.BForm,
						Gender: curr.Gender,
						Phone: curr.Phone,
						AlternatePhone: curr.AlternatePhone,
						Active: curr.Active,
						FatherName: curr.ManName,
						FatherCNIC: curr.ManCNIC,
						Birthdate: curr.Birthdate,
						Address: curr.Address,
						StartDate: moment(curr.StartDate).format("DD/MM/YYYY"),
						AdmissionNumber: curr.AdmissionNumber,
						BloodType: curr.BloodType,
						Religion: curr.Religion
					}
				]
			}, [])

		// download csv using papa parser
		downloadAsCSV(csv_data, CSVHeaders, section_name)
	}

	return (
		<div className="exports-modal">
			<div className="close button red" onClick={onClose}>✕</div>
			<div className="title">Students Export</div>
			<div className="section-container section">
				<div className="row">
					<label>Select to export</label>
					<select onChange={(e) => setSectionID(e.target.value)}>
						<option value="">Select Class</option>
						{
							sections
								.sort((a, b) => a.classYear - b.classYear)
								.map(section => <option key={section.id} value={section.id}> {section.namespaced_name} </option>)
						}
					</select>
				</div>
				<div className="row">
					<label></label>
					<div className="button blue" onClick={generateCSV}>Export as CSV</div>
				</div>
			</div>
		</div>
	)
}

export default StudentExportModal