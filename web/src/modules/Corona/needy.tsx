import React from 'react'
import Former from 'utils/former'

interface P {
	student: MISStudent
	onSubmit: (student: MISStudent) => void
	onClose: () => void

	language?: "en" | "ur"
}

interface S {
	needy_form: NeedyForm
}

class NeedyModal extends React.Component<P, S> {

	former: Former
	constructor(props: P) {
		super(props)

		this.state = {
			needy_form: {
				needy: true,
				needyStatus: "",
				orphan: "",
				familyMembers: "",
				membersWhoEarn: "",
				approxIncome: "",
				earnThisMonth: "",
				incomeSource: "",
				occupation: "",
				jobPlace: "",
			}
		}

		this.former = new Former(this, ["needy_form"])
	}

	submitForm = () => {

		const needy_student = {
			...this.props.student,
			...this.state.needy_form
		}

		// invoke save method
		this.props.onSubmit(needy_student)
	}

	render() {

		const { language } = this.props

		return <div className="needy-form">
			<div className="close button red" onClick={this.props.onClose}>✕</div>
			{
				language === "en" && <>
					<div className="title">Neediness Form</div>
					<div className="form-container scrollbar">
						<div className="form">
							<div className="row">
								<label>Is the student an orphan?</label>
								<select {...this.former.super_handle(["orphan"])}>
									<option value="">Select option</option>
									<option value="YES">Yes</option>
									<option value="NO">No</option>
									<option value="DONT_KNOW">Don't Know</option>
								</select>
							</div>
							<div className="row">
								<label>How many household members are there in the house?</label>
								<input type="number" {...this.former.super_handle(["familyMembers"])} placeholder="e.g. 5" />
							</div>

							<div className="row">
								<label>How many people earn in this household?</label>
								<input type="number" {...this.former.super_handle(["membersWhoEarn"])} placeholder="e.g. 1" />
							</div>

							<div className="row">
								<label>Please select the source of income: </label>
								<select {...this.former.super_handle(["incomeSource"])}>
									<option value="">Select Option</option>

									<option value="GOVT_JOB">Job (Govt. sector)</option>
									<option value="PRIVATE_JOB">Job (Private Sector)</option>
									<option value="SEMI_GOVT">Semi-Government</option>
									<option value="BUSINESS">Business - small shop/restaurant/auto-rickshaw</option>
									<option value="FARMING">Farming</option>
									<option value="CATTLE_POULTRY">Cattle/poultry</option>
									<option value="DONT_KNOW">Don't know</option>
								</select>
							</div>

							{
								this.state.needy_form.incomeSource === "PRIVATE_JOB" &&
								<div className="row">
									<label>Please select occupation type</label>
									<select {...this.former.super_handle(["occupation"])}>
										<option value="">Select Option</option>
										<option value="TEACHING">Teaching</option>
										<option value="SCHOOL_ADMIN">School Admin</option>
										<option value="JANITOR">Janitorial staff - peon/guard etc. in school</option>
										<option value="DOCTOR">Doctor</option>
										<option value="NURSE">Nurse</option>
										<option value="POLICE">Police</option>
										<option value="WORKER">Worker</option>
										<option value="LABORER">Laborer</option>
										<option value="DONT_KNOW">Don't Know</option>
									</select>
								</div>
							}

							{
								(this.state.needy_form.occupation === "TEACHING" ||
									this.state.needy_form.occupation === "SCHOOL_ADMIN" ||
									this.state.needy_form.occupation === "JANITOR") &&
								<div className="row">
									<label>Please select school</label>
									<select {...this.former.super_handle(["jobPlace"])}>
										<option value="">Select Option</option>
										<option value="CURRENT_SCHOOL">In this school</option>
										<option value="OTHER_SCHOOL">In other school</option>
										<option value="DONT_KNOW">Don't Know</option>
									</select>
								</div>
							}

							<div className="row">
								<label>Approximately how much they earn in a normal month?</label>
								<input type="number" {...this.former.super_handle(["approxIncome"])} placeholder="e.g. 10000" />
							</div>
							<div className="row">
								<label>Did they still earn any amount of earning this month?</label>
								<select {...this.former.super_handle(["earnThisMonth"])}>
									<option value="">Select option</option>
									<option value="YES">Yes</option>
									<option value="NO">No</option>
									<option value="DONT_KNOW">Don't Know</option>
								</select>
							</div>
							<div className="row">
								<label>On a scale of 1-5, how needy is this student?</label>
								<select {...this.former.super_handle(["needyStatus"])}>
									<option value="">Select Option</option>
									<option value="NOT_NEEDY">Not Needy</option>
									<option value="SOMEWHAT_NEEDY">Somewhat Needy</option>
									<option value="EXTREMELY_NEEDY">Extremely Needy</option>
									<option value="DONT_KNOW">Don't Know</option>
								</select>
							</div>

							<div className="button blue" style={{ marginTop: 20 }} onClick={this.submitForm}>Submit Form</div>
						</div>
					</div>
				</>
			}

			{
				language === "ur" && <>
					<div className="title urdu-lang title">فارم برائے ضرورت مندی</div>
					<div className="form-container scrollbar urdu-lang">
						<div className="form urdu">
							<div className="row">
								<label>کیا طالبِ علم یتیم ہے؟</label>
								<select {...this.former.super_handle(["orphan"])}>
									<option value="">انتخاب کریں</option>
									<option value="YES">جی ہاں</option>
									<option value="NO">نہیں</option>
									<option value="DONT_KNOW">معلوم نہیں</option>
								</select>
							</div>
							<div className="row">
								<label>اس گھرانے میں کل کتنے افراد رہتے ہیں؟</label>
								<input type="number" {...this.former.super_handle(["familyMembers"])} placeholder="مثلاً 5" />
							</div>

							<div className="row">
								<label>گھر میں کتنے افراد کماتے ہیں؟</label>
								<input type="number" {...this.former.super_handle(["membersWhoEarn"])} placeholder="مثلاً 1" />
							</div>

							<div className="row">
								<label>آمدنی کا بنیادی ذریعہ منتخب کریں:</label>
								<select {...this.former.super_handle(["incomeSource"])}>
									<option value="">انتخاب کریں</option>
									<option value="GOVT_JOB">سرکاری ملازمت</option>
									<option value="PRIVATE_JOB">نجی ملازمت</option>
									<option value="SEMI_GOVT">نیم سرکاری</option>
									<option value="BUSINESS">کاروبار - دکان / ہوٹل/ رکشہ/ ٹیکسی وغیر</option>
									<option value="FARMING">کھیتی باڑی</option>
									<option value="CATTLE_POULTRY">مویشی کا کام</option>
									<option value="DONT_KNOW">معلوم نہیں</option>
								</select>
							</div>

							{
								this.state.needy_form.incomeSource === "PRIVATE_JOB" &&
								<div className="row">
									<label>ان کی ملازمت کا پیشہ منتخب کریں:</label>
									<select {...this.former.super_handle(["occupation"])}>
										<option value="">انتخاب کریں</option>
										<option value="TEACHING">اسکول میں ٹیچر</option>
										<option value="SCHOOL_ADMIN">اسکول ایڈمن</option>
										<option value="JANITOR">اسکول میں پیون/ گارڈ/ خاکروب وغیر</option>
										<option value="NURSE">نرس</option>
										<option value="POLICE">پولیس</option>
										<option value="WORKER">ورکر</option>
										<option value="DOCTOR">ڈاکٹر</option>
										<option value="LABORER">مزدور</option>
										<option value="OTHER">Other</option>
										<option value="DONT_KNOW">معلوم نہیں</option>
									</select>
								</div>
							}

							{
								(this.state.needy_form.occupation === "TEACHING" ||
									this.state.needy_form.occupation === "SCHOOL_ADMIN" ||
									this.state.needy_form.occupation === "JANITOR") &&
								<div className="row">
									<label>اسکول منتخب کریں:</label>
									<select {...this.former.super_handle(["jobPlace"])}>
										<option value="">انتخاب کریں</option>
										<option value="CURRENT_SCHOOL">اسی اسکول میں</option>
										<option value="OTHER_SCHOOL">کسی اور اسکول میں</option>
										<option value="DONT_KNOW">معلوم نہیں</option>
									</select>
								</div>
							}

							<div className="row">
								<label>اندازً اس گھرانے کی ایک عام مہینے میں کتنی آمدن ہوتی ہے ؟</label>
								<input type="number" {...this.former.super_handle(["approxIncome"])} placeholder="مثلاً 10000" />
							</div>
							<div className="row">
								<label>کیا اس گھرانے میں اس مہینے کوئی آمدنی آئی ہے؟</label>
								<select {...this.former.super_handle(["earnThisMonth"])}>
									<option value="">انتخاب کریں</option>
									<option value="YES">جی ہاں</option>
									<option value="NO">نہیں</option>
									<option value="DONT_KNOW">معلوم نہیں</option>
								</select>
							</div>
							<div className="row">
								<label>یہ طالبِ علم کتنا ضرورت مند ہے؟</label>
								<select {...this.former.super_handle(["needyStatus"])}>
									<option value="">انتخاب کریں</option>
									<option value="NOT_NEEDY">بلکل بھی ضرورت مند نہیں</option>
									<option value="SOMEWHAT_NEEDY">کچھ ضرورت مند</option>
									<option value="EXTREMELY_NEEDY">بہت زیادہ ضرورت مند</option>
									<option value="DONT_KNOW">معلوم نہیں</option>
								</select>
							</div>
							<div className="button blue urdu-lang small" style={{ marginTop: 20, lineHeight: "1.5" }} onClick={this.submitForm}>فارم جمع کرائیں</div>
						</div>
					</div>
				</>
			}
		</div >
	}
}

export default NeedyModal