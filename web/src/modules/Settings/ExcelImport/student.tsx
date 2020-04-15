import React, { ChangeEvent } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { v4 } from 'node-uuid'

import Former from 'utils/former'
import getSectionsFromClasses from 'utils/getSectionsFromClasses'
import downloadCSV from 'utils/downloadCSV'
import { createStudentMerges } from 'actions'
import Banner from 'components/Banner'
import toTitleCase from 'utils/toTitleCase'
import Papa from 'papaparse'

import { DocumentDownloadIcon, TrashOutlineIcon } from 'assets/icons'

import './style.css'
import Hyphenator from 'utils/Hyphenator'

interface S {

	importedStudents: MISStudent[]
	loadingStudentImport: boolean
	banner: {
		active: boolean
		good?: boolean
		text?: string
	}
	selectedSection: string
	selectedFileName: string
}

type P = {
	students: RootDBState['students']
	classes: RootDBState['classes']
	saveStudents: (student: MISStudent[]) => void
}

const studentCSVHeaders = [
	"Name",
	"RollNumber",
	"BForm",
	"Gender (M/F)",
	"Phone",
	"Active (Yes/No)",
	"FatherCNIC",
	"FatherName",
	"Birthdate (dd/mm/yyyy)",
	"Address",
	"Notes",
	"StartDate (dd/mm/yyyy)",
	"AdmissionNumber"
]

const studentPreviewTableHeaders = [
	"B-Form",
	"Father Name",
	"Father CNIC",
	"Active",
	"Gender",
	"DOB",
	"Admission Date",
	"Admission No.",
	"Roll No",
	"Phone",
	"Address",
	"Notes"
]

class StudentExcelImport extends React.Component<P, S> {

	former: Former
	constructor(props: P) {
		super(props)

		this.state = {
			importedStudents: [],
			loadingStudentImport: false,
			banner: {
				active: false,
				good: false,
				text: ""
			},
			selectedSection: "",
			selectedFileName: "Choose File..."
		}

		this.former = new Former(this, [])
	}

	onStudentImportTemplateClick = () => {
		// download student import csv file
		downloadCSV([studentCSVHeaders], "student-import-template")
	}

	importStudentData = (e: ChangeEvent<HTMLInputElement>) => {

		const file = e.target.files[0]

		if (file === undefined) {
			return
		}

		this.setState({
			selectedFileName: file.name
		})

		const reader = new FileReader()

		reader.onloadend = () => {

			const text = reader.result as string

			const importedStudents = convertCSVToStudents(text)

			const malformedData = importedStudents.find(s => {

				const matchingAdmission = s.AdmissionNumber && Object.values(this.props.students)
					.find(existing => existing.AdmissionNumber && existing.AdmissionNumber === s.AdmissionNumber)

				if (matchingAdmission) {

					setTimeout(() => {
						this.setState({
							banner: {
								active: false
							}
						})
					}, 5000)

					this.setState({
						banner: {
							active: true,
							good: false,
							text: `A student with Admission Number ${matchingAdmission.AdmissionNumber} already exists in the data`
						}
					})

					return true
				}

				// const matchingRollNumber = s.RollNumber && Object.values(this.props.students)
				// 	.find(existing => existing.RollNumber && existing.RollNumber === s.RollNumber)

				// if (matchingRollNumber) {
				// 	setTimeout(() => {
				// 		this.setState({
				// 			banner: {
				// 				active: false
				// 			}
				// 		})
				// 	}, 5000)
				// 	this.setState({
				// 		banner: {
				// 			active: true,
				// 			good: false,
				// 			text: `A student with Roll Number ${matchingRollNumber.RollNumber} already exists in the data.`
				// 		}
				// 	})

				// 	return true
				// }

				return false
			})

			if (!malformedData) {
				this.setState({
					loadingStudentImport: false,
					importedStudents
				})
			} else {
				this.setState({
					loadingStudentImport: false
				})
			}
		}

		reader.onloadstart = () => {
			this.setState({
				loadingStudentImport: true,
				banner: {
					active: false
				}
			})
		}

		reader.readAsText(file)
	}

	onSave = () => {

		const section_id = this.state.selectedSection
		const students = this.state.importedStudents

		if (section_id.length === 0) {
			alert("Please select class first to save students!")
			return
		}

		const classed_students = students
			.map(s => ({
				...s,
				section_id
			}))

		if (window.confirm(`Are you sure you want to Save ${students.length} Students?`)) {

			this.props.saveStudents(classed_students)

			this.setState({
				importedStudents: [],
				selectedFileName: "Choose File...",
				banner: {
					active: true,
					good: true,
					text: "Students have been saved successfully"
				}
			})

			setTimeout(() => { this.setState({ banner: { active: false } }) }, 2000)
		}

	}

	removeStudent = (id: string): void => {

		if (!window.confirm("Are you sure you want to remove?")) {
			return
		}

		const filtered_students = this.state.importedStudents.filter(student => student.id !== id)

		this.setState({
			importedStudents: filtered_students
		})

	}

	render() {

		const students = this.state.importedStudents

		const banner = this.state.banner

		return <React.Fragment>
			{banner.active && <Banner isGood={banner.good} text={banner.text} />}
			<div className="section-container excel-import-students" style={{ marginTop: 10 }}>
				<div className="title">Excel Import</div>
				<div className="row" style={{ justifyContent: "flex-end" }}>
					<div className="button grey" style={{ display: "flex" }} onClick={this.onStudentImportTemplateClick}>
						<img width={20} height={20} src={DocumentDownloadIcon} alt="document-download" />
						<div style={{ marginTop: 2 }}>Download Template</div>
					</div>
				</div>
				<div className="section form" style={{ marginTop: 10 }}>
					<div className="row">
						<div className="file-upload-container">
							<label className="file-upload">
								<input type="file" aria-label="file-browser" onChange={this.importStudentData} accept=".csv" />
								<span className="file-upload-custom">{this.state.selectedFileName}</span>
							</label>
						</div>
					</div>
				</div>

				{this.state.loadingStudentImport && <div>Loading student import sheet....</div>}

				{
					!this.state.loadingStudentImport && students.length > 0 && <>
						<div className="divider">Preview Students List</div>
						<div className="section">
							<div className="form">
								<div className="row">
									<label>Add All Students to Class</label>
									<select {...this.former.super_handle(["selectedSection"])}>
										<option value="">Select Class</option>
										{
											getSectionsFromClasses(this.props.classes)
												.sort((a, b) => (a.classYear || 0) - (b.classYear || 0))
												.map(s => <option key={s.id} value={s.id}>{s.namespaced_name}</option>)
										}
									</select>
								</div>

								<div className="row">
									<label>Total Students: {students.length}</label>
									<div />
								</div>

								<div className="table-wrapper">
									<table>
										<thead>
											<tr>
												<th></th>
												{studentPreviewTableHeaders.map(header => <th key={header}> {header}</th>)}
											</tr>
										</thead>
										<tbody>
											{
												students.map(student => <tr key={student.id}>
													<td className="text-left">
														<div style={{ display: "flex", alignItems: "center" }}>
															<div className="delete-button">
																<img src={TrashOutlineIcon} alt="delete" onClick={() => this.removeStudent(student.id)} />
															</div>
															<div>{student.Name}</div>
														</div>
													</td>
													<td>{student.BForm}</td>
													<td className="text-left">{student.ManName}</td>
													<td>{student.ManCNIC}</td>
													<td>{student.Active ? "Yes" : "No"}</td>
													<td>{student.Gender}</td>
													<td>{student.Birthdate}</td>
													<td>{moment(student.StartDate).format("DD-MM-YYYY")}</td>
													<td>{student.AdmissionNumber}</td>
													<td>{student.RollNumber}</td>
													<td>{student.Phone}</td>
													<td className="text-left">{student.Address}</td>
													<td className="text-left">{student.Notes}</td>
												</tr>)
											}
										</tbody>
									</table>
								</div>
							</div>
						</div>
						<div className="row" style={{ justifyContent: "flex-end" }}>
							<div className="save button" onClick={this.onSave}>Save Students</div>
						</div>
					</>
				}
			</div>
		</React.Fragment>
	}
}

const formatCNIC = (cnic: string): string => {

	if (cnic === "" || cnic.length < 13) {
		return cnic
	}

	return Hyphenator(cnic)
}

const formatPhone = (phone: string): string => {

	if (phone === "" || phone.length >= 11) {
		return phone
	}

	// append '0' at start if not present due to auto excel conversion text to number
	return "0".concat(phone)
}

const convertCSVToStudents = (studentImportCSV: string) => {

	// // naive csv parse, will break on commas.
	// const lines = studentImportCSV.split('\n')
	// 	.map(x => x.split(',').map(x => x.trim()))
	// 	.filter(x => x.length === studentCSVHeaders.length)
	// 	.slice(1) // ignore headers

	// papa parse handles CSV parsing gracefully with zero dependency
	const { data, errors, meta } = Papa.parse(studentImportCSV)

	console.log(data, errors, meta)

	const items: Array<string> = data
		.filter(x => x.length === studentCSVHeaders.length)
		.slice(1) // ignore headers

	// note that this is linked to the headers in the template above. see
	const students = items
		.map(([Name, RollNumber, BForm, Gender, Phone, Active, ManCNIC, ManName, Birthdate, Address, Notes, StartDate, AdmissionNumber]) => {

			const student: MISStudent = {
				id: v4(),
				Name: toTitleCase(Name),
				RollNumber,
				BForm: formatCNIC(BForm),
				Gender: Gender.toLowerCase() === "m" ? "male" : (Gender.toLowerCase() === "f" ? "female" : ""),
				Phone: formatPhone(Phone),
				Active: Active.toLowerCase() === "y" || Active.toLowerCase() === "yes" || Active.toLowerCase() === "true" || Active.toLowerCase() === "",
				ManCNIC: formatCNIC(ManCNIC),
				ManName: toTitleCase(ManName),
				Birthdate,
				Address,
				Notes,
				StartDate: StartDate ? moment(StartDate, "DD/MM/YYYY").unix() * 1000 : new Date().getTime(), // shady...
				AdmissionNumber,
				Fee: 0,

				section_id: "",
				BloodType: "",
				prospective_section_id: "",

				fees: {},
				payments: {},
				attendance: {},
				exams: {},
				tags: {},
				certificates: {},
			}

			return student
		})

	return students
}

export default connect((state: RootReducerState) => ({
	students: state.db.students,
	classes: state.db.classes
}), (dispatch: Function) => ({
	saveStudents: (students: MISStudent[]) => dispatch(createStudentMerges(students))
}))(StudentExcelImport)