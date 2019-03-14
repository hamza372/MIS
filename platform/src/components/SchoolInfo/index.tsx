import React from 'react'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom'

import moment from 'moment'
import Former from '~/src/utils/former'
import { getSchoolProfiles, reserveMaskedNumber, releaseMaskedNumber, rejectSchool, saveCallEndSurvey, saveSchoolRejectedSurvey} from '~/src/actions'
import Modal from '~/src/components/Modal'


import './style.css'

interface OwnProps {
	school_id: string
}

interface StateProps {
	school?: CERPSchool
	schoolMatch?: SchoolMatch
}

// survey is basically going to be an event
// from our perspective, we want to know from the first call what the customer purchase likelihood is 
// we want to know if they will take a next_step
	// if they will take a next step, it can appear on home page 
// 

interface StateType {
	showSurvey: false | "NOT_INTERESTED" | "CALL_END"

	call_end_survey: CallEndSurvey['meta']
	not_interested_survey: NotInterestedSurvey['meta']

}

interface DispatchProps {
	addSchool: () => void
	releaseNumber: () => void
	reserveNumber: () => void
	rejectSchool: () => void
	saveCallEndSurvey: (survey: CallEndSurvey['meta']) => void
	saveSchoolRejectedSurvey: (survey: NotInterestedSurvey['meta']) => void
}

type propTypes = OwnProps & StateProps & DispatchProps & RouteComponentProps

class SchoolInfo extends React.Component<propTypes, StateType> {

	former: Former
	constructor(props : propTypes) {
		super(props);

		if(props.school === undefined) {
			props.addSchool()
		}

		this.state = {
			showSurvey: false,
			call_end_survey: {
				customer_interest: "",
				customer_likelihood: "",
				follow_up_meeting: "",
				follow_up_meeting_date: new Date().getTime(),
				other_notes: ""
			},
			not_interested_survey: {
				reason_rejected: "",
				other_reason: ""
			}
		}

		this.former = new Former(this, [])

	}

	componentWillReceiveProps(nextProps : propTypes) {

		if(nextProps.school === undefined && nextProps.school_id !== this.props.school_id) {
			nextProps.addSchool()
		}

		// if we currently have a call_in_progress and the next props has a call_end event
		// then we need to display the survey.

		const current_call_in_progress = call_in_progress(this.props.schoolMatch)
		const next_call = call_in_progress(nextProps.schoolMatch)

		if(current_call_in_progress && !next_call && this.props.school_id === nextProps.school_id) {

			this.setState({
				showSurvey: "CALL_END"
			})
		}
	}

	onShowNumber = () => {
		this.props.reserveNumber()
	}

	onMarkComplete = () => {
		console.log('mark as complete')

		const res = confirm('Are you sure you want to Mark as Complete? Tell us why')

		if(res) {
			this.props.releaseNumber()
		}
	}

	onMarkRejected = () => {
		console.log('mark as reject')

		// can show a rejection survey here maybe

		this.setState({
			showSurvey: "NOT_INTERESTED"
		})
		this.props.rejectSchool()
	}

	onClose = () => {
		this.props.history.push({
			pathname: this.props.location.pathname,
			search: ''
		})
	}

	saveCallEndSurvey = () => {

		console.log("saving survey", this.state)

		if(this.state.showSurvey === "CALL_END") {
			this.props.saveCallEndSurvey(this.state.call_end_survey)
		}

		if(this.state.showSurvey === "NOT_INTERESTED") {
			this.props.saveSchoolRejectedSurvey(this.state.not_interested_survey)
		}

		this.setState({
			showSurvey: false
		})

	}

	render() {

		const school = this.props.school;
		if(school === undefined) {
			return <div className="loading">Loading School Info...</div>
		}

		const reserved = this.props.schoolMatch && this.props.schoolMatch.status === "IN_PROGRESS"

		const schoolMatch = this.props.schoolMatch;
		const hasHistory = schoolMatch.history && Object.keys(schoolMatch.history).length > 0;

		let estimated_monthly_revenue = ""

		if(isValid(school.lowest_fee) && isValid(school.highest_fee) && isValid(school.total_enrolment)) {
			estimated_monthly_revenue = ((parseInt(school.lowest_fee) + parseInt(school.highest_fee))/2 * parseInt(school.total_enrolment)).toLocaleString() + " Rs"
		}

		return <div className="school-info page" style={{ padding: "5px" }}>
			<div className="close" onClick={this.onClose}>Close</div>
			<div className="title" style={{ marginTop: 0, textAlign: "center" }}>{school.school_name}</div>

			<div className="form" style={{width: "90%"}}>

				{
					hasHistory && <SchoolHistory schoolMatch={schoolMatch} />
				}

				{
					hasHistory && <div className="divider">Profile</div>
				}

				{
					this.state.showSurvey === "CALL_END" && 
					<Modal>
						<div className="modal">
							<div className="title">Call Finished</div>

							<div className="form" style={{ width: "90%"}}>

								<div className="row">
									<label>Is the customer interested in using the Product?</label>
									<select {...this.former.super_handle(["call_end_survey", "customer_interest"])}>
										<option value="">Please Select an Answer</option>
										<option value="YES">Yes</option>
										<option value="UNSURE">Unsure</option>
										<option value="NO">No</option>
									</select>
								</div>

								<div className="row">
									<label>How strongly do you feel the client will make a purchase?</label>
									<select {...this.former.super_handle(["call_end_survey", "customer_likelihood"])}>
										<option value="">Please select an option</option>
										<option value="HIGH">High - I think they will buy from us</option>
										<option value="MEDIUM">Medium - I am not sure</option>
										<option value="LOW">Low - They did not say no, but probably not</option>
										<option value="ZERO">Zero - They will not buy from us</option>
										<option value="NA">Question is not relevant</option>
									</select>
								</div>

								<div className="row">
									<label>Will you have another meeting with the client?</label>
									<select {...this.former.super_handle(["call_end_survey", "follow_up_meeting"])}>
										<option value="">Please Select an Answer</option>
										<option value="YES">Yes</option>
										<option value="NO">No</option>
									</select>
								</div>

								<div className="row">
									<label>When is the meeting scheduled for?</label>
									<input type="date" {...this.former.super_handle(["call_end_survey", "follow_up_meeting_date"])} />
								</div>

								<div className="row">
									<label>Other Notes</label>
									<input type="text" {...this.former.super_handle(["call_end_survey", "other_notes"])} placeholder="Enter other notes here" />
								</div>

								<div className="row">
									<div className="button blue" onClick={this.saveCallEndSurvey}>Save</div>
								</div>
							</div>
						</div>
					</Modal>
				}

				{
					this.state.showSurvey === "NOT_INTERESTED" && 
					<Modal>
						<div className="modal">
							<div className="title">Marked Not Interested</div>

							<div className="form" style={{ width: "90%"}}>

								<div className="row">
									<label>Reason for marking Not Interested</label>
									<select {...this.former.super_handle(["not_interested_survey", "reason_rejected"])}>
										<option value="">Select </option>
										<option value="PRODUCT_TOO_EXPENSIVE">The Product is too expensive</option>
										<option value="PRODUCT_NOT_RELEVANT">The product is not relevant for them</option>
										<option value="PRODUCT_NOT_GOOD_ENOUGH">The product does not fulfill or address their needs</option>
										<option value="OTHER">Other Reason</option>
									</select>
								</div>

								{ this.state.not_interested_survey.reason_rejected === "OTHER" ? <div className="row">
									<label>Why are they not interested?</label>
									<input type="text" {...this.former.super_handle(["not_interested_survey", "other_reason"])} placeholder="" />
								</div> : false 
								}

								<div className="row">
									<div className="button blue" onClick={this.saveCallEndSurvey}>Save</div>
								</div>
							</div>
						</div>
					</Modal>
				}

				<div className="row">
					<label>Status</label>
					<div>{this.props.schoolMatch.status}</div>
				</div>
				{ 
					reserved && 
					<div className="row">
						<label>Phone Number</label>
						<a href={`tel:${this.props.schoolMatch.masked_number}`} className="number">{this.props.schoolMatch.masked_number}</a> 
					</div>
				}

				<SurveyRow label="Respondant Name" val={school.respondent_name} />
				<SurveyRow label="Respondent is Owner" val={school.respondent_owner} />
				<SurveyRow label="Respondent Relation" val={school.respondent_relation} />
				<SurveyRow label="Respondent Gender" val={school.respondent_gender} />
				<SurveyRow label="Year Established" val={school.year_established} />
				<SurveyRow label="Address" val={school.school_address} />
				<SurveyRow label="Tehsil" val={school.school_tehsil} />
				<SurveyRow label="District" val={school.school_district} />
				<SurveyRow label="Building Rented" val={school.school_building_rent} />
				<SurveyRow label="Number of Branches" val={school.school_branches} />
				<SurveyRow label="Number of Rooms" val={school.no_of_rooms} />
				<SurveyRow label="Medium of Instruction" val={school.instruction_medium} />
				<SurveyRow label="Teachers Employed" val={school.teachers_employed} />
				<SurveyRow label="Facilities" val={map_facilities(school.school_facilities)} />
				<SurveyRow label="Has Smartphone" val={school.smart_phone} />
				<SurveyRow label="Registered" val={school.school_registration} />
				<SurveyRow label="PEF School" val={school.school_pef} />
				<SurveyRow label="SEF School" val={school.school_sef} />
				<SurveyRow label="FEF School" val={school.school_fef} />
				<SurveyRow label="Lowest Fee" val={school.lowest_fee} />
				<SurveyRow label="Highest Fee" val={school.highest_fee} />
				<SurveyRow label="Enrollment" val={school.total_enrolment} />
				<SurveyRow label="Reported Monthly Revenue" val={school.monthly_fee_collected} />
				<SurveyRow label="CERP Estimated Monthly Revenue" val={estimated_monthly_revenue} />
				<SurveyRow label="Highest Grade" val={school.highest_grade} />
				<SurveyRow label="Lowest Grade" val={school.lowest_grade} />

				<div className="divider">Financing</div>

				<SurveyRow label="Financing Interest" val={school.financing_interest} />
				<SurveyRow label="Unmet Need" val={school.unmet_financing_needs} />
				<SurveyRow label="Current Loan Outstanding" val={school.previous_loan} />
				<SurveyRow label="Outstanding Loan Amount" val={school.previous_loan_amount} />

				<div className="divider">Education Services</div>
				<SurveyRow label="Textbook Provider Interest" val={school.textbook_provider_interest} />
				<SurveyRow label="Current Textbook Provider" val={map_textbook_providers(school.textbook_publisher)} />
				<SurveyRow label="Previously Purchased Products" val={map_ess_products(school.ess_current)} />
				<SurveyRow label="Current Product Interests" val={map_ess_products(school.ess_interest)} />

				<div className="save-delete">
					{ !reserved &&
						<div className="red button" onClick={this.onMarkRejected}>Not Interested</div>
					}
					{ reserved ? 
						<div className="button purple" onClick={this.onMarkComplete}>Mark as Complete</div> :
						<div className="button blue" onClick={this.onShowNumber}>Show Number</div>
					}
				</div>
			</div>
		</div>
	}
}

const call_in_progress = ( schoolMatch : SchoolMatch) : boolean => {

	if(schoolMatch.history === undefined) {
		return false;
	}

	const call_events = Object.values(schoolMatch.history)
		.filter(x => x.event === "CALL_START" || x.event === "CALL_END")
		.sort((a, b) => a.time - b.time)

	const unmatched_call_event = call_events.reduce((agg : SupplierInteractionEvent[], curr) => {
		if(curr.event === "CALL_START") {
			return [...agg, curr]
		}
		if(curr.event === "CALL_END") {
			// is there a previous call_start event?
			const prev = agg.pop();
			if(prev && prev.event === "CALL_START") {
				return agg;
			}
			return [...agg, prev, curr]
		}
	}, [])

	if(unmatched_call_event.length > 0) {
		console.log(unmatched_call_event);
		return true;
	}

	return false;
}

interface SchoolMatchProps {
	schoolMatch: SchoolMatch
}

const SchoolHistory : React.SFC<SchoolMatchProps> = (props : SchoolMatchProps) => {

	const combined_events = Object.values(props.schoolMatch.history)
		.sort((a, b) => a.time - b.time)
		.reduce((agg, curr) => {
			if(curr.event == "CALL_START" || curr.event == "CALL_BACK") {
				return agg;
			}

			return [
				...agg,
				curr
			]
		}, [])

	return <div className="school history">
		<div className="divider">History</div>

		<div className="row">
			<div><b>Date</b></div>
			<div><b>Time</b></div>
			<div><b>User</b></div>
			<div><b>Event</b></div>
			<div><b>Status</b></div>
		</div>
		{
			combined_events
				.map(v => <div className="row" key={v.time}>
					<div>{moment(v.time).format("DD/MM")}</div>
					<div>{moment(v.time).format("HH:mm")}</div>
					<div>{
						// @ts-ignore
						v.user.name.name || v.user.name
					}</div>
					<div>{v.event}</div>
					<div>{v.meta ? v.meta.call_status : ""}</div>
					{
						v.event === "CALL_END" ? console.log("META:", v.meta) : false
					}
					
				</div>)
		}
	</div>
}

const isValid = (field : string) => {
	return !(field.trim() === "" || field === "999")
}

const map_facilities = (facilities : string) => {

	const map = [
		"Boundary Wall",
		"Library",
		"UPS",
		"Generator",
		"Computer/Tablets",
		"Projector",
		"Sports Ground & Equipment",
		"Internet",
		"Solar Power"
	]

	return facilities.split(' ').map(x => map[parseInt(x)]).join(", ")
}

const map_ess_products = (products : string) => {
	const map = [
		"Teacher & Management Training",
		"Learning & Teaching Materials",
		"Match/Science Materials & Language Programs",
		"Education Technology",
		"Management Information System",
		"School Supplies",
		"School Furniture",
		"None of the Above"
	]

	return products.split(' ').map(x => map[parseInt(x)]).join(", ")
}

const map_textbook_providers = (textbooks : string) => {
	const map = [
		"Oxford",
		"Aafaq",
		"Gohar",
		"Punjab Textbook Board",
		"Sun Pace",
		"Galaxy",
		"Dawn",
		"Hadia",
		"Babar",
		"Javaid",
		"Other"
	]

	return textbooks.split(' ').map(x => map[parseInt(x)]).join(", ")
}

interface SurveyRowProp {
	label: string
	val: string
}

const SurveyRow : React.StatelessComponent<SurveyRowProp> = ({ label, val }) => {

	if(!isValid(val)) {
		return null;
	}

	return <div className="row">
		<label>{label}</label>
		<div>{val}</div>
	</div>
}

// in the future this page should show if a call is in progress
// and when it ends
// and when it ends we ask questions via modal

export default connect<StateProps, DispatchProps, OwnProps>((state : RootBankState, props: OwnProps) => ({
	school: state.new_school_db[props.school_id],
	schoolMatch: state.sync_state.matches[props.school_id]
}), (dispatch : Function, props: OwnProps ) => ({
	addSchool: () => dispatch(getSchoolProfiles([props.school_id])),
	reserveNumber: () => dispatch(reserveMaskedNumber(props.school_id)),
	releaseNumber: () => dispatch(releaseMaskedNumber(props.school_id)),
	rejectSchool: () => dispatch(rejectSchool(props.school_id)),
	saveCallEndSurvey: (survey: CallEndSurvey['meta']) => dispatch(saveCallEndSurvey(props.school_id, survey)),
	saveSchoolRejectedSurvey: (survey: NotInterestedSurvey['meta']) => dispatch(saveSchoolRejectedSurvey(props.school_id, survey))
}))(withRouter(SchoolInfo))
