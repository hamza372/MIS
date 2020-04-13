import React from 'react'
import Former from 'utils/former'
import Hyphenator from 'utils/Hyphenator'

interface P {
	student: MISStudent & NeedyForm
	onSubmit: (needy_form: NeedyForm) => void
	onClose: () => void

	language?: "en" | "ur"
}

interface S {
	needy_form: NeedyForm & {
		Phone: string
		ManCNIC: string
	}
}

class NeedyModal extends React.Component<P, S> {

	former: Former
	constructor(props: P) {
		super(props)

		const student = this.props.student

		this.state = {
			needy_form: {
				Needy: student.Needy || true,
				NeedyStatus: student.NeedyStatus || "",
				Orphan: student.Orphan || "",
				FamilyMembers: student.FamilyMembers || "",
				MembersWhoEarn: student.MembersWhoEarn || "",
				ApproxIncome: student.ApproxIncome || "",
				EarnThisMonth: student.EarnThisMonth || "",
				IncomeSource: student.IncomeSource || "",
				Occupation: student.Occupation || "",
				JobPlace: student.JobPlace || "",
				ReceivedAnyDonation: student.ReceivedAnyDonation || "",
				ManCNIC: student.ManCNIC || "",
				Phone: student.Phone || "",
			}
		}

		this.former = new Former(this, ["needy_form"])
	}

	submitForm = () => {

		// invoke save method
		this.props.onSubmit(this.state.needy_form)
	}

	addHyphens = () => {
		this.setState({
			needy_form: {
				...this.state.needy_form,
				ManCNIC: Hyphenator(this.state.needy_form.ManCNIC)
			}
		})
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
								<label>Please enter Father/Guardian CNIC:</label>
								<input type="text"
									{...this.former.super_handle(
										["ManCNIC"],
										(cnic) => cnic.length <= 15,
										this.addHyphens)
									}
									placeholder="35103-3293273-4" />
							</div>
							<div className="row">
								<label>Please enter <strong>Active Contact</strong> number:</label>
								<input type="text" {...this.former.super_handle(["Phone"])} placeholder="03065869273" />
							</div>
							<div className="row">
								<label>Is the student an orphan?</label>
								<select {...this.former.super_handle(["Orphan"])}>
									<option value="">Select option</option>
									<option value="YES">Yes</option>
									<option value="NO">No</option>
									<option value="DONT_KNOW">Don't Know</option>
								</select>
							</div>
							<div className="row">
								<label>How many household members are there in the house?</label>
								<input type="number" {...this.former.super_handle(["FamilyMembers"])} placeholder="e.g. 5" />
							</div>

							<div className="row">
								<label>How many people earn in this household?</label>
								<input type="number" {...this.former.super_handle(["MembersWhoEarn"])} placeholder="e.g. 1" />
							</div>
							<div className="row">
								<label>Please select the source of income: </label>
								<select {...this.former.super_handle(["IncomeSource"])}>
									<option value="">Select Option</option>

									<option value="GOVT_JOB">Job (Govt. sector)</option>
									<option value="PRIVATE_JOB">Job (Private Sector)</option>
									<option value="SEMI_GOVT">Job (semi-govt./contract based)</option>
									<option value="BUSINESS">Business - small shop/restaurant/auto-rickshaw</option>
									<option value="FARMING">Farming</option>
									<option value="CATTLE_POULTRY">Cattle/poultry</option>
									<option value="DONT_KNOW">Don't know</option>
								</select>
							</div>

							{
								this.state.needy_form.IncomeSource === "PRIVATE_JOB" &&
								<div className="row">
									<label>Please select occupation type</label>
									<select {...this.former.super_handle(["Occupation"])}>
										<option value="">Select Option</option>
										<option value="TEACHER">Teacher</option>
										<option value="SCHOOL_ADMIN">School Admin</option>
										<option value="GUARD">Guard</option>
										<option value="FACTORY_WORKER">Factory worker</option>
										<option value="LABORER">Laborer</option>
										<option value="MASON">Mason</option>
										<option value="CARPENTER">Carpenter</option>
										<option value="PAINTER">Painter</option>
										<option value="MECHANIC">Mechanic</option>
										<option value="WELDER">Welder</option>
										<option value="OFFICE_BOY">Office job / clerk</option>
										<option value="OTHER">Other</option>
										<option value="DONT_KNOW">Don't Know</option>
									</select>
								</div>
							}

							{
								this.state.needy_form.IncomeSource === "PRIVATE_JOB" &&
								this.state.needy_form.Occupation === "OTHER" && <>
									<div className="row">
										<label>Other</label>
										<input type="text" {...this.former.super_handle(["Occupation"])} placeholder="e.g. Accountant" />
									</div>
								</>
							}

							{
								this.state.needy_form.IncomeSource === "PRIVATE_JOB" &&
								(this.state.needy_form.Occupation === "TEACHER" ||
									this.state.needy_form.Occupation === "SCHOOL_ADMIN" ||
									this.state.needy_form.Occupation === "GUARD" ||
									this.state.needy_form.Occupation === "OFFICE_BOY") &&
								<div className="row">
									<label>Please select school</label>
									<select {...this.former.super_handle(["JobPlace"])}>
										<option value="">Select Option</option>
										<option value="CURRENT_SCHOOL">In this school</option>
										<option value="OTHER_SCHOOL">In other school</option>
										<option value="DONT_KNOW">Don't Know</option>
									</select>
								</div>
							}

							<div className="row">
								<label>Approximately how much they earn in a normal month?</label>
								<input type="number" {...this.former.super_handle(["ApproxIncome"])} placeholder="e.g. 10000" />
							</div>
							<div className="row">
								<label>Did they still earn any amount of earning this month?</label>
								<select {...this.former.super_handle(["EarnThisMonth"])}>
									<option value="">Select option</option>
									<option value="YES">Yes</option>
									<option value="NO">No</option>
									<option value="DONT_KNOW">Don't Know</option>
								</select>
							</div>
							<div className="row">
								<label>Are they getting any donation from govt./relatives/organizations??</label>
								<select {...this.former.super_handle(["ReceivedAnyDonation"])}>
									<option value="">Select option</option>
									<option value="YES">Yes</option>
									<option value="NO">No</option>
									<option value="DONT_KNOW">Don't Know</option>
								</select>
							</div>
							<div className="row">
								<label>Please rank how much needy this student is?</label>
								<select {...this.former.super_handle(["NeedyStatus"])}>
									<option value="">Select Option</option>
									<option value="SOMEWHAT_NEEDY">Somewhat Needy</option>
									<option value="QUITE_NEEDY">Quite Needy</option>
									<option value="VERY_NEEDY">Very Needy</option>
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
								<label>والد/ سرپرست کا قومی شناختی کارڈ نمبر درج کریں:</label>
								<input type="text"
									{...this.former.super_handle(
										["ManCNIC"],
										(cnic) => cnic.length <= 15,
										this.addHyphens)
									}
									placeholder="35103-3293273-4" />
							</div>
							<div className="row">
								<label>استعمال ہونے والا فون نمبر درج کریں:</label>
								<input type="text" {...this.former.super_handle(["Phone"])} placeholder="03065869273" />
							</div>
							<div className="row">
								<label>کیا طالبِ علم یتیم ہے؟</label>
								<select {...this.former.super_handle(["Orphan"])}>
									<option value="">انتخاب کریں</option>
									<option value="YES">جی ہاں</option>
									<option value="NO">نہیں</option>
									<option value="DONT_KNOW">معلوم نہیں</option>
								</select>
							</div>

							<div className="row">
								<label>اس گھرانے میں کل کتنے افراد رہتے ہیں؟</label>
								<input type="number" {...this.former.super_handle(["FamilyMembers"])} placeholder="مثلاً 5" />
							</div>

							<div className="row">
								<label>گھر میں کتنے افراد کماتے ہیں؟</label>
								<input type="number" {...this.former.super_handle(["MembersWhoEarn"])} placeholder="مثلاً 1" />
							</div>

							<div className="row">
								<label>آمدنی کا بنیادی ذریعہ منتخب کریں:</label>
								<select {...this.former.super_handle(["IncomeSource"])}>
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
								this.state.needy_form.IncomeSource === "PRIVATE_JOB" &&
								<div className="row">
									<label>ان کی ملازمت کا پیشہ منتخب کریں:</label>
									<select {...this.former.super_handle(["Occupation"])}>
										<option value="">انتخاب کریں</option>
										<option value="TEACHING">اسکول میں ٹیچر</option>
										<option value="SCHOOL_ADMIN">اسکول ایڈمن</option>
										<option value="GUARD">گارڈ</option>
										<option value="FACTORY_WORKER">فیکٹری ورکر</option>
										<option value="LABORER">مزدور</option>
										<option value="MASON">مستری</option>
										<option value="CARPENTER">کارپینٹر</option>
										<option value="PAINTER">نقاش</option>
										<option value="MECHANIC">میکینک</option>
										<option value="WELDER">ویلڈنگ</option>
										<option value="OFFICE_BOY">کلرک</option>
										<option value="OTHER">کوئی اور</option>
										<option value="DONT_KNOW">معلوم نہیں</option>
									</select>
								</div>
							}

							{
								this.state.needy_form.IncomeSource === "PRIVATE_JOB" &&
								this.state.needy_form.Occupation === "OTHER" && <>
									<div className="row">
										<label>کوئی اور</label>
										<input type="text" {...this.former.super_handle(["Occupation"])} placeholder="مثلاً اکاؤنٹنٹ" />
									</div>
								</>
							}

							{
								this.state.needy_form.IncomeSource === "PRIVATE_JOB" &&
								(this.state.needy_form.Occupation === "TEACHER" ||
									this.state.needy_form.Occupation === "SCHOOL_ADMIN" ||
									this.state.needy_form.Occupation === "GUARD") &&
								<div className="row">
									<label>اسکول منتخب کریں:</label>
									<select {...this.former.super_handle(["JobPlace"])}>
										<option value="">انتخاب کریں</option>
										<option value="CURRENT_SCHOOL">اسی اسکول میں</option>
										<option value="OTHER_SCHOOL">کسی اور اسکول میں</option>
										<option value="DONT_KNOW">معلوم نہیں</option>
									</select>
								</div>
							}

							<div className="row">
								<label>اندازً اس گھرانے کی ایک عام مہینے میں کتنی آمدن ہوتی ہے ؟</label>
								<input type="number" {...this.former.super_handle(["ApproxIncome"])} placeholder="مثلاً 10000" />
							</div>
							<div className="row">
								<label>کیا انہیں رثتےداروں/ گاوں والوں سے / حکومت یا کسی فلاحی ادارے سے امداد موصول ہوئی ہے؟</label>
								<select {...this.former.super_handle(["ReceivedAnyDonation"])}>
									<option value="">انتخاب کریں</option>
									<option value="YES">جی ہاں</option>
									<option value="NO">نہیں</option>
									<option value="DONT_KNOW">معلوم نہیں</option>
								</select>
							</div>
							<div className="row">
								<label>یہ طالبِ علم کتنا ضرورت مند ہے؟</label>
								<select {...this.former.super_handle(["NeedyStatus"])}>
									<option value="">انتخاب کریں</option>
									<option value="SOMEWHAT_NEEDY">طالبِ علم کو امداد کی تھوڑی ضرورت</option>
									<option value="QUITE_NEEDY">طالب۔علم کو امداد کی کافی حد تک ضرورت</option>
									<option value="VERY_NEEDY">طالبِ علم کو یقینی طور پر بے حد ضرورت ہے</option>
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