import React from 'react'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom'

import Former from '~/src/utils/former'
import { getSchoolProfiles, reserveMaskedNumber, releaseMaskedNumber, rejectSchool } from '~/src/actions'
import Modal from '~/src/components/Modal'


import './style.css'

interface OwnProps {
	school_id: string
}

interface StateProps {
	school?: CERPSchool
	schoolMatch?: SchoolMatch
}

interface StateType {
	showSurvey: boolean

	survey: {
		random_question: string
	}

}

interface DispatchProps {
	addSchool: () => void
	releaseNumber: () => void
	reserveNumber: () => void
	rejectSchool: () => void
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
			survey: {
				random_question: ""
			}
		}

		this.former = new Former(this, ["survey"])

	}

	componentWillReceiveProps(nextProps : propTypes) {

		if(nextProps.school === undefined && nextProps.school_id !== this.props.school_id) {
			nextProps.addSchool()
		}

		// if we currently have a call_in_progress and the next props has a call_end event
		// then we need to display the survey.

		const current_call_in_progress = call_in_progress(this.props.schoolMatch)
		const next_call = call_in_progress(nextProps.schoolMatch)

		if(current_call_in_progress && !next_call) {
			this.setState({
				showSurvey: true
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

		this.props.rejectSchool()
	}

	onClose = () => {
		this.props.history.push({
			pathname: this.props.location.pathname,
			search: ''
		})
	}

	saveSurvey = () => {

		console.log("saving survey", this.state)

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

		// is a call in progress right now?
		// i.e. did a call_start happen without a corresponding call_end event

		// did a call JUST end? 


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
					this.state.showSurvey && 
					<Modal>
						<div className="modal">
							<div className="title">Call Finished</div>

							<div className="form" style={{ width: "90%"}}>
								<div className="row">
									<label>How was your call?</label>
									<input type="text" {...this.former.super_handle(["random_question"])} placeholder={"Tell Us Now"} />
								</div>

								<div className="row">
									<div className="button blue" onClick={this.saveSurvey}>Save</div>
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
				<div className="row">
					<label>Lowest Fee</label>
					<div>{school.lowest_fee} Rs</div>
				</div>
				<div className="row">
					<label>Highest Fee</label>
					<div>{school.highest_fee} Rs</div>
				</div>
				<div className="row">
					<label>Monthly Fee</label>
					<div>{school.monthly_fee_collected} Rs</div>
				</div>
				<div className="row">
					<label>Enrollment</label>
					<div>{school.total_enrolment}</div>
				</div>
				<div className="row">
					<label>Estimated Monthly Revenue</label>
					<div>{(parseInt(school.lowest_fee) + parseInt(school.highest_fee))/2 * parseInt(school.total_enrolment)} Rs</div>
				</div>
				<div className="row">
					<label>Lowest Grade</label>
					<div>{school.lowest_grade}</div>
				</div>
				<div className="row">
					<label>Highest Grade</label>
					<div>{school.highest_grade}</div>
				</div>
				<div className="row">
					<label>Number of Rooms</label>
					<div>{school.no_of_rooms}</div>
				</div>
				<div className="row">
					<label>Financing Interest</label>
					<div>{school.financing_interest}</div>
				</div>
				<div className="row">
					<label>Textbook Interest</label>
					<div>{school.textbook_provider_interest}</div>
				</div>
				<div className="row">
					<label>District</label>
					<div>{school.school_district_confirm}</div>
				</div>
				<div className="row">
					<label>Address</label>
					<div>{school.school_address}</div>
				</div>
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

	const unmatched_call_event = call_events.reduce((agg : SchoolMatchEvent[], curr) => {
		if(curr.event === "CALL_START") {
			return [...agg, curr]
		}
		if(curr.event === "CALL_END") {
			// is there a previous call_start event?
			const prev = agg.pop();
			if(prev.event === "CALL_START") {
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
const SchoolHistory : React.SFC<SchoolMatchProps> = (props) => {

	return <div className="school history">
		<div className="divider">History</div>

		{
			Object.values(props.schoolMatch.history)
				.map(v => <div className="row" key={v.time}>
					<div>{new Date(v.time).toLocaleTimeString()}</div>
					<div>{new Date(v.time).toLocaleDateString()}</div>
					<div>{
						// @ts-ignore
						v.user.name.name || v.user.name
					}</div>
					<div>{v.event}</div>
				</div>)
		}
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
	rejectSchool: () => dispatch(rejectSchool(props.school_id))
}))(withRouter(SchoolInfo))
