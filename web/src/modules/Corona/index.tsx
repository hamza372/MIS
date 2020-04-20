import React from 'react'
import { connect } from 'react-redux'
import { Link, RouteComponentProps } from 'react-router-dom'

import getSectionsFromClasses from 'utils/getSectionsFromClasses'
import { saveStudentNeedyForm } from 'actions/index'
import Layout from 'components/Layout'
import Modal from 'components/Modal'

import Former from 'utils/former'
import NeedyModal from './needy'

import './style.css'

type P = {
	students: RootDBState['students']
	classes: RootDBState['classes']

	saveStudentNeedyForm: (student: MISStudent, needy_form: NeedyForm) => void

} & RouteComponentProps

interface S {
	filter: {
		section_id: string
	}
	modal_active: boolean
	active_student?: NeedyStudent
	language: "en" | "ur"
	sections: AugmentedSection[]
}

type NeedyStudent = MISStudent & NeedyForm

class CoronaModule extends React.Component<P, S> {

	former: Former
	constructor(props: P) {
		super(props)

		const sections = getSectionsFromClasses(this.props.classes)
			.sort((a, b) => a.classYear - b.classYear)

		const section_id = sections && sections[0] ? sections[0].id : ""

		this.state = {
			filter: {
				section_id
			},
			sections,
			modal_active: false,
			language: "en"
		}

		this.former = new Former(this, [])
	}

	onCheckboxSelect = (student: MISStudent) => () => {

		console.log('checkbox selected for ', student.Name)

		this.setState({
			modal_active: true,
			active_student: student
		})

	}

	modalClose = () => {

		// save the active student
		this.setState({
			modal_active: false
		})
	}

	submitForm = (needy_form: NeedyForm) => {

		// save the active student
		this.setState({
			modal_active: false
		})

		// save needy student
		this.props.saveStudentNeedyForm(this.state.active_student, needy_form)
	}


	render() {

		const { sections, language } = this.state

		return <Layout history={this.props.history}>
			<div className="section-container corona">
				{
					this.state.modal_active && <Modal>
						<NeedyModal
							student={this.state.active_student}
							onSubmit={this.submitForm}
							onClose={this.modalClose}
							language={language}
						/>
					</Modal>
				}
				<div className="title">Corona Module</div>
				<div className="section-container">
					<div className="form">
						<div className="row">
							<label>Language</label>
							<select {...this.former.super_handle(["language"])}>
								<option value="en">English</option>
								<option value="ur">Urdu</option>
							</select>
						</div>
					</div>
					<div dir="auto">
						{
							this.state.language === "en" ?
								<div>
									<p>The basic purpose of this module is to collect the information of deserving needy students' families so that we can provide their information to those organizations which can help.
									Please remember that we can't assure you that who will be helped because the welfare organizations used this information to help needy. We hope that you will help us to collect the the information of
									 deserving needy families.</p>
									<p><strong>Note: </strong>Please fill form with verified information from parents.</p>
								</div> :
								<div className="urdu-lang small">
									<p>اس موڈیول کا مقصد حقدارضرورت مند طالبِ علم کے گھرانوں کی معلومات حاصل کرنا ہے تاکہ ایسے اداروں تک پہنچائیں جو اس مشکل وقت میں اِن کی مدد کریں۔ یاد رکھیں کہ ہم یہ یقین سے نہیں بتاسکتے کہ کس کی مدد کی جائیگی کیوں کہ فلاحی ادارے اس معلومات کے ذریعے مدد کریں گے۔  ہمیں امید ہے کہ آپ حقدار ضرورت مند گھرانوں کی معلومات حاصل کرنے میں ہماری مدد کریں گے.</p>
									<p><strong>نوٹ:</strong> براہِ مہربانی والدین سے تصدیق شدہ معلومات درج کریں</p>
								</div>
						}
					</div>
				</div>
				<div className="section-container section">
					<div className="form">
						<div className="row">
							<label>class</label>
							<select {...this.former.super_handle(["filter", "section_id"])}>
								<option value="">Select Class</option>
								{
									sections
										.map(s => <option key={s.id} value={s.id}>{s.namespaced_name}</option>)
								}
							</select>
						</div>
					</div>
					<div className="table" style={{ marginTop: 15 }}>
						<table style={{ width: "100%" }}>
							<thead>
								<tr>
									<td>Roll #</td>
									<td>Name</td>
									<td>Father Name</td>
									<td>Needy</td>
								</tr>
							</thead>
							<tbody>
								{
									Object.values(this.props.students)
										.filter(s => this.state.filter.section_id && s.section_id === this.state.filter.section_id)
										.sort((a, b) => parseInt(a.RollNumber) - parseInt(b.RollNumber))
										.map((s: NeedyStudent) => {

											return <tr key={s.id}>
												<td>{s.RollNumber}</td>
												<td>{<Link to={`/student/${s.id}/profile`}>{s.Name}</Link>}</td>
												<td>{s.ManName}</td>
												<td>
													<input type="checkbox" onChange={this.onCheckboxSelect(s)} checked={s.Needy || false} />
												</td>
											</tr>
										})
								}
							</tbody>
						</table>
					</div>
				</div>
			</div>

		</Layout>
	}

}

export default connect((state: RootReducerState) => ({
	students: state.db.students,
	classes: state.db.classes
}), (dispatch: Function) => ({
	saveStudentNeedyForm: (student: MISStudent, needy_form: NeedyForm) => dispatch(saveStudentNeedyForm(student, needy_form))
}))(CoronaModule)