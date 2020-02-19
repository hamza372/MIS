import React, { Component } from 'react'
import Layout from 'components/Layout'
import { connect } from 'react-redux'
import { sendSMS, sendBatchSMS } from 'actions/core'
import { logSms, addDiary } from 'actions'
import Banner from 'components/Banner'
import { smsIntentLink } from 'utils/intent'
import { getSectionsFromClasses } from 'utils/getSectionsFromClasses'
import { RouteComponentProps } from 'react-router-dom'
import former from 'utils/former'
import moment from 'moment'
import getSectionFromId from 'utils/getSectionFromId'
import DiaryPrintable from 'components/Printable/Diary/diary'

import './style.css'

interface P {
	students: RootDBState["students"]
	classes: RootDBState["classes"]
	settings: RootDBState["settings"]
	faculty_id: string
	diary: RootDBState["diary"]

	addDiary: (date: string, section_id: string, diary: MISDiary["section_id"]) => any
	sendMessage: (text: string, number: string) => any
	sendBatchMessages: (messages: MISSms[]) => any
	logSms: (history: MISSMSHistory) => any
}

interface S {
	banner: {
		active: boolean
		good?: boolean
		text?: string
	}
	selected_date: number
	selected_section_id: string
	selected_student_phone: string
	students_filter: string
	diary: MISDiary["date"]
}

type propTypes = RouteComponentProps & P

class Diary extends Component<propTypes, S> {

	former: former
	constructor(props: propTypes) {
		super(props)

		const curr_date = moment().format("DD-MM-YYYY")

		const propsDiary = this.props.diary && this.props.diary[curr_date] ? JSON.parse(JSON.stringify(this.props.diary[curr_date])) : undefined

		const diary = propsDiary ? {
			...Object.entries(this.getDiaryTemplate())
				.reduce((agg, [sec_id, diary]) => {
					return {
						...agg,
						[sec_id]: {
							//@ts-ignore
							...diary,
							...propsDiary[sec_id]
						}
					}
				}, {})
		} : this.getDiaryTemplate()

		this.state = {
			banner: {
				active: false,
				good: true,
				text: "Saved!"
			},

			selected_date: moment.now(),
			selected_section_id: "",
			selected_student_phone: "",
			students_filter: "all_students",
			diary
		}

		this.former = new former(this, [])
	}

	getDiaryTemplate = () => {
		return Object.values(this.props.classes)
			.reduce((agg, c) => {

				const sectionObj = Object.keys(c.subjects)
					.reduce((agg, s) => {
						return {
							...agg,
							[s]: {
								homework: ""
							}
						}
					}, {})

				const obj = Object.keys(c.sections)
					.reduce((agg, sec_id) => {
						return {
							...agg,
							[sec_id]: sectionObj
						}
					}, {})

				return { ...agg, ...obj }
			}, {})
	}

	logSms = (messages: MISSms[]) => {

		if (messages.length === 0) {
			console.log("No Messaged to Log")
			return
		}

		const historyObj = {
			faculty: this.props.faculty_id,
			date: new Date().getTime(),
			type: "DIARY",
			count: messages.length,
		}

		this.props.logSms(historyObj)
	}

	diaryFilterCallback = () => {

		const curr_date = moment(this.state.selected_date).format("DD-MM-YYYY")

		// get selected date diary from previous props, else empty diary
		const selected_date_diary = this.props.diary && this.props.diary[curr_date] ?
			JSON.parse(JSON.stringify(this.props.diary[curr_date])) : this.getDiaryTemplate()
		// updating the diary state
		this.setState({
			diary: selected_date_diary
		})
	}


	UNSAFE_componentWillReceiveProps(nextProps: propTypes) {

		const curr_date = moment(this.state.selected_date).format("DD-MM-YYYY")

		// check diary in selected date diary nextProps and get, otherwise look for previous props else empty diary
		const selected_date_diary = nextProps.diary && nextProps.diary[curr_date] ?
			JSON.parse(JSON.stringify(nextProps.diary[curr_date])) :
			this.props.diary && this.props.diary[curr_date] ? JSON.parse(JSON.stringify(this.props.diary[curr_date])) : this.getDiaryTemplate()

		this.setState({
			diary: { ...this.state.diary, ...selected_date_diary }
		})
	}

	onSave = () => {

		const curr_date = moment(this.state.selected_date).format("DD-MM-YYYY")

		// Here need to save modified section subjects for selected date rather then the whole section's diary
		const diary = Object.entries(this.state.diary[this.state.selected_section_id])
			.filter(([subject, { homework }]) => {

				return this.props.diary[curr_date] && this.props.diary[curr_date][this.state.selected_section_id] ?
					this.props.diary[curr_date][this.state.selected_section_id][subject] ?
						this.props.diary[curr_date][this.state.selected_section_id][subject].homework !== homework
						: true
					: homework !== ""

			})
			.reduce((agg, [subject, homework]) => {
				return {
					...agg,
					[subject]: homework
				}

			}, {})
		// adding diary
		this.props.addDiary(curr_date, this.state.selected_section_id, diary)

		this.setState({
			banner: {
				active: true,
				good: true,
				text: "Saved!"
			}
		})

		setTimeout(() => {
			this.setState({
				banner: {
					active: false
				}
			})
		}, 1000);
	}

	diaryString = (): string => {

		if (this.state.selected_section_id === "" || this.state.diary[this.state.selected_section_id] === undefined) {
			console.log("Not running diary")
			return ""
		}

		const curr_date = `Date: ${moment(this.state.selected_date).format("DD MMMM YYYY")}\n`
		const section_name = `Class: ${this.getSelectedSectionName()}\n`

		const diary_message = Object.entries(this.state.diary[this.state.selected_section_id])
			.map(([subject, { homework }]) => `${subject}: ${homework}`)

		return curr_date + section_name + diary_message.join("\n")
	}

	getSelectedSectionStudents = () => {
		return Object.values(this.props.students)
			.filter(s => s.section_id === this.state.selected_section_id &&
				(s.tags === undefined || !s.tags["PROSPECTIVE"]) &&
				s.Phone !== undefined && s.Phone !== "")
	}

	getFilterCondition = (student: MISStudent) => {

		const curr_attendance = student.attendance[moment(this.state.selected_date).format("YYYY-MM-DD")]

		switch (this.state.students_filter) {
			case "absent_students":
				return curr_attendance ? curr_attendance.status === "ABSENT" : false
			case "leave_students":
				return curr_attendance ? curr_attendance.status === "LEAVE" ||
					curr_attendance.status === "SHORT_LEAVE" ||
					curr_attendance.status === "SICK_LEAVE" ||
					curr_attendance.status === "CASUAL_LEAVE"
					: false
			default:
				return true // if student_filter set to 'all_students'
		}
	}

	getSelectedSectionName = (): string => {
		const { selected_section_id } = this.state
		const { classes } = this.props

		const section = getSectionFromId(selected_section_id, classes)

		return section && section.namespaced_name ? section.namespaced_name : ""
	}

	getMessages = (): MISSms[] => {

		const phone = this.state.selected_student_phone
		const diary = this.diaryString()

		// in case of single student
		if (phone && phone !== "") {
			return [{ number: phone, text: diary }]
		}

		const selected_students = this.getSelectedSectionStudents().filter(s => this.getFilterCondition(s))

		const messages = selected_students
			.reduce((agg, student) => {

				const index = agg.findIndex(s => s.number === student.Phone)

				if (index >= 0) {
					return agg
				}

				return [
					...agg,
					{
						number: student.Phone,
						text: diary
					}
				]

			}, [])

		return messages
	}

	getSelectedSectionDiary = () => {

		const { selected_section_id, diary } = this.state

		return Object.entries(diary[selected_section_id] || {})
			.reduce((agg, [subject, { homework }]) => {
				return {
					...agg,
					[subject]: homework
				}

			}, {} as { [id: string]: string })
	}

	render() {

		const { classes, sendBatchMessages, settings } = this.props;

		// ascending order of classes/sections
		const sortedSections = getSectionsFromClasses(classes).sort((a, b) => (a.classYear || 0) - (b.classYear || 0));

		const messages = this.getMessages()

		const subjects = new Set<string>()

		for (const mis_class of Object.values(classes)) {

			if (this.state.selected_section_id !== "" && mis_class.sections[this.state.selected_section_id] !== undefined) {
				Object.keys(mis_class.subjects).forEach(s => subjects.add(s))
			}
		}

		return <Layout history={this.props.history}>
			<div className="diary">
				{this.state.banner.active ? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false}
				<div className="no-print title">School Diary</div>
				<div className="no-print form">
					<div className="divider">Send Diary for {moment(this.state.selected_date).format("DD-MMMM-YYYY")}</div>
					<div className="section">
						<div className="row">
							<label>Diary Date</label>
							<input type="date"
								onChange={this.former.handle(["selected_date"], () => true, () => this.diaryFilterCallback())}
								value={moment(this.state.selected_date).format("YYYY-MM-DD")}
								placeholder="Diary Date" />
						</div>
						<div className="row">
							<label>Select Class/Section</label>
							<select {...this.former.super_handle(["selected_section_id"])}>
								<option value="" disabled>Select Section</option>
								{
									sortedSections.map(s => <option key={s.id} value={s.id}>{s.namespaced_name}</option>)
								}
							</select>
						</div>
						{
							this.state.selected_section_id !== "" && <div className="no-print row">
								<label>Send Diary to</label>
								<select {...this.former.super_handle(["students_filter"])}>
									<option value="" disabled>Select Students</option>
									<option value="all_students"> All students</option>
									<option value="absent_students"> Only Absent students</option>
									<option value="leave_students"> Only Leave students</option>
									<option value="single_student"> Single student</option>
								</select>
							</div>
						}
						{
							this.state.students_filter === "single_student" && <div className="no-print row">
								<label>Select Student</label>
								<datalist id="student-list">
									{[...Object.entries(this.props.students)
										.filter(([, student]) => student &&
											(student.tags === undefined || !student.tags["PROSPECTIVE"]) &&
											student.section_id === this.state.selected_section_id &&
											student.Phone)
										.sort(([, a], [, b]) => a.Name.localeCompare(b.Name))
										.map(([id, student]) => <option key={id} value={student.Phone}>{student.Name}</option>)
									]}
								</datalist>
								<input list="student-list" {...this.former.super_handle(["selected_student_phone"])} placeholder="Select Student" />
							</div>
						}
					</div>
					{
						this.state.selected_section_id !== "" && <div className="section">
							{
								Array.from(subjects)
									.sort((a, b) => a.localeCompare(b))
									.map((subject) => <div className="table row" key={subject}>
										<div>{subject}:</div>
										<input
											type="text"
											style={{ textAlign: "left" }}
											{...this.former.super_handle(["diary", this.state.selected_section_id, subject, "homework"])}
											placeholder="Enter Homework" />
									</div>)
							}

							{subjects.size > 0 && <div className="button blue" onClick={this.onSave}>Save</div>}

						</div>
					}

					{
						subjects.size === 0 ? false : <div className="row">
							{
								settings.sendSMSOption === "SIM" ?
									<a className="button blue mb"
										style={{ marginBottom: "12px" }}
										href={smsIntentLink({
											messages,
											return_link: window.location.href
										})}
										onClick={() => this.logSms(messages)}>
										Send using Local SIM </a>
									:
									<div className="row button" onClick={() => sendBatchMessages(messages)} style={{ width: "20%" }}>Send</div>
							}
							<div className="button" onClick={() => window.print()}>Print</div>
						</div>
					}

				</div>
				{this.state.selected_section_id && <DiaryPrintable
					schoolName={this.props.settings.schoolName}
					sectionName={this.getSelectedSectionName()}
					diaryDate={moment(this.state.selected_date).format("DD, MMMM YYYY")}
					schoolDiary={this.getSelectedSectionDiary()}
				/>
				}
			</div>
		</Layout>
	}
}
export default connect((state: RootReducerState) => ({
	faculty_id: state.auth.faculty_id,
	diary: state.db.diary,
	students: state.db.students,
	classes: state.db.classes,
	settings: state.db.settings
}), (dispatch: Function) => ({
	sendMessage: (text: string, number: string) => dispatch(sendSMS(text, number)),
	sendBatchMessages: (messages: MISSms[]) => dispatch(sendBatchSMS(messages)),
	logSms: (history: MISSMSHistory) => dispatch(logSms(history)),
	addDiary: (date: string, section_id: string, diary: MISDiary["section_id"]) => dispatch(addDiary(date, section_id, diary))
}))(Diary);