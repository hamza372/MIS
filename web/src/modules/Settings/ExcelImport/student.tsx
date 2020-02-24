import React, { ChangeEvent } from 'react'
import { connect } from 'react-redux'
import moment from 'moment';
import { v4 } from 'node-uuid';

import Former from 'utils/former'
import getSectionsFromClasses from 'utils/getSectionsFromClasses';
import downloadCSV from 'utils/downloadCSV'
import { createStudentMerges } from 'actions';
import Banner from 'components/Banner'

interface S {

	importedStudents: MISStudent[]
	loadingStudentImport: boolean
	banner: {
		active: boolean
		good?: boolean
		text?: string
	}
	selectedSection: string
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
	"Active",
	"FatherCNIC",
	"FatherName",
	"Birthdate (dd/mm/yyyy)",
	"Address",
	"Notes",
	"StartDate (dd/mm/yyyy)",
	"AdmissionNumber"
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
			selectedSection: ""
		}

		this.former = new Former(this, [])
	}

	onStudentImportTemplateClick = () => {
		// download student import csv file
		downloadCSV([studentCSVHeaders], "student-import-template")
	}

	importStudentData = (e: ChangeEvent<HTMLInputElement>) => {
		
		const file = e.target.files[0]
		if(file === undefined) {
			return;
		}

		const reader = new FileReader();

		reader.onloadend = () => {
			const text = reader.result as string

			const importedStudents = convertCSVToStudents(text)

			const malformedData = importedStudents.find(s => {

				const matchingAdmission = s.AdmissionNumber && Object.values(this.props.students)
					.find(existing => existing.AdmissionNumber && existing.AdmissionNumber === s.AdmissionNumber)
				
				if(matchingAdmission) {
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

					return true;
				}
				
				/*
				const matchingRollNumber = s.RollNumber && Object.values(this.props.students)
					.find(existing => existing.RollNumber && existing.RollNumber === s.RollNumber)

				if(matchingRollNumber) {
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
							text: `A student with Roll Number ${matchingRollNumber.RollNumber} already exists in the data.`
						}
					})

					return true;
				}
				*/

				return false;
			})

			if(!malformedData) {
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
		
		const classed_students = this.state.importedStudents
			.map(s => ({
				...s,
				section_id: this.state.selectedSection
			}))

		this.props.saveStudents(classed_students)

		this.setState({
			importedStudents: []
		})

	}

	render() {

		const student = this.state.importedStudents[0]

		const banner = this.state.banner

		return <React.Fragment>
			{ banner.active && <Banner isGood={banner.good} text={banner.text} /> }
			<div className="form" style={{width: "90%"}}>
				<div className="title">Excel Import</div>

				<div className="row">
					<label>Student Template CSV</label>
					<div className="button grey" onClick={this.onStudentImportTemplateClick}>Download Template</div>
				</div>

				<div className="row">
					<label>Upload Student Data CSV</label>
					<div className="fileContainer button green">
						<div>Upload CSV</div>
						<input type="file" accept=".csv" onChange={this.importStudentData}/>
					</div>
				</div>

				{ this.state.loadingStudentImport && <div>Loading student import sheet....</div> }

				{ this.state.importedStudents.length > 0 && <div className="row">
					<label>Add All Students to Class</label>
					<select {...this.former.super_handle(["selectedSection"])}>
						<option value="">Select Class</option>
						{
							getSectionsFromClasses(this.props.classes)
								.map(s => <option key={s.id} value={s.id}>{s.namespaced_name}</option>)
						}
					</select>
				</div>}

				{ this.state.importedStudents.length > 0 && <div className="section">
					<div className="divider">Student Preview</div>

					<div className="row">
						<label>Total Number of Students</label>
						<div>{this.state.importedStudents.length}</div>
					</div>

					<div style={{textAlign: "center", fontSize: "1.1rem"}}>Example Student</div>

					<div className="row">
						<label>Name</label>
						<div>{student.Name}</div>
					</div>

					<div className="row">
						<label>Roll Number</label>
						<div>{student.RollNumber}</div>
					</div>

					<div className="row">
						<label>BForm</label>
						<div>{student.BForm}</div>
					</div>

					<div className="row">
						<label>Gender</label>
						<div>{student.Gender}</div>
					</div>

					<div className="row">
						<label>Phone</label>
						<div>{student.Phone}</div>
					</div>

					<div className="row">
						<label>Active</label>
						<div>{student.Active}</div>
					</div>

					<div className="row">
						<label>Father CNIC</label>
						<div>{student.ManCNIC}</div>
					</div>

					<div className="row">
						<label>Father Name</label>
						<div>{student.ManName}</div>
					</div>

					<div className="row">
						<label>Birthdate</label>
						<div>{student.Birthdate}</div>
					</div>

					<div className="row">
						<label>Address</label>
						<div>{student.Address}</div>
					</div>

					<div className="row">
						<label>Notes</label>
						<div>{student.Notes}</div>
					</div>

					<div className="row">
						<label>Start Date</label>
						<div>{moment(student.StartDate).format("DD/MM/YYYY")}</div>
					</div>

					<div className="row">
						<label>Admission Number</label>
						<div>{student.AdmissionNumber}</div>
					</div>

				</div> }

				<div className="row">
					<div className="save button" onClick={this.onSave}>Save</div>
				</div>
			</div>
		</React.Fragment>
	}
}

const convertCSVToStudents = (studentImportCSV: string ) => {

	// naive csv parse, will break on commas.
	const lines = studentImportCSV.split('\n')
		.map(x => x.split(',').map(x => x.trim()))
		.filter(x => x.length === studentCSVHeaders.length)
		.slice(1) // ignore headers

	console.log(studentImportCSV)
	console.log(lines)

	// note that this is linked to the headers in the template above. see 
	const students = lines.map(([Name, RollNumber, BForm, Gender, Phone, Active, ManCNIC, ManName, Birthdate, Address, Notes, StartDate, AdmissionNumber]) => {
		const student: MISStudent = {
			id: v4(),
			Name,
			RollNumber,
			BForm,
			Gender: Gender.toLowerCase() === "m" ? "male" : ( Gender.toLowerCase() === "f" ? "female" : ""),
			Phone,
			Active: Active.toLowerCase() === "y" || Active.toLowerCase() === "yes" || Active.toLowerCase() === "true" || Active.toLowerCase() === "",
			ManCNIC,
			ManName,
			Birthdate,
			Address,
			Notes,
			StartDate: StartDate ? moment(StartDate, "DD/MM/YYYY").unix() * 1000 : new Date().getTime(), // shady...
			AdmissionNumber,
			Fee: 0,

			section_id: "",
			BloodType: "",
			prospective_section_id: "",

			fees: { },
			payments: { },
			attendance: { },
			exams: { },
			tags: { },
			certificates: { }
		}
	
		return student;
	})

	// at this point should show some preview of the students
	// 
	console.log(students)

	return students;
	
}

export default connect((state: RootReducerState) => ({
	students: state.db.students,
	classes: state.db.classes
}), (dispatch: Function) => ({
	saveStudents: (students: MISStudent[]) => dispatch(createStudentMerges(students))
}))(StudentExcelImport)