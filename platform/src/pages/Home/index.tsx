import React from 'react'
import { connect } from 'react-redux'
import { Link, RouteComponentProps } from 'react-router-dom'
import moment from 'moment'

import { forceSaveFullStatePotentiallyCausingProblems, getSchoolProfiles, saveCallEndSurvey } from '~/src/actions'
import Modal from '~/src/components/Modal'

import CallEndSurveyComponent from '~/src/components/Surveys/CallEndSurvey'

import './style.css'

type propTypes = {

	sync_state: RootBankState['sync_state']
	school_db: RootBankState['new_school_db']
	saveFullState: () => void
	addSchools: (ids: string[]) => void
	saveCallEndSurvey: (school_id: string, survey: CallEndSurvey['meta']) => void
} & RouteComponentProps

interface stateType {
	loading: boolean
	showSurvey: boolean
	current_school: string,
	current_school_survey_num: number
}

class Home extends React.Component<propTypes, stateType> {

	constructor(props : propTypes) {
		super(props);

		const blank = Object.keys(props.sync_state.matches)
			.filter(k => props.school_db[k] == undefined)
		
		if(blank.length > 0) {
			props.addSchools(blank)
		}

		this.state = {
			loading: blank.length > 0,
			showSurvey: false,
			current_school: "",
			current_school_survey_num: 0
		}
	}

	componentWillReceiveProps(nextProps : propTypes) {

		const blank = Object.keys(nextProps.sync_state.matches)
			.filter(k => nextProps.school_db[k] == undefined)

		this.setState({ loading: blank.length > 0 })
	}

	onSchoolClick = (school_id : string) => () => {
		this.props.history.push({
			pathname: this.props.location.pathname,
			search: `?school_id=${school_id}`
		})
	}

	onSurveyClick = (school_id : string) => () => {
		
		const num = Object.values(this.props.sync_state.matches[school_id].history || {})
			.filter(x => x.event === "CALL_END_SURVEY")
			.length

		this.setState({
			showSurvey: true,
			current_school: school_id,
			current_school_survey_num: num
		})
	}

	saveSurvey = (survey : CallEndSurvey['meta']) => {
		this.props.saveCallEndSurvey(this.state.current_school, survey)
		this.setState({
			current_school: "",
			showSurvey: false
		})
	}

	render() {
		// if no number is set in auth, should ask them here

		const numbers = this.props.sync_state.numbers;
		const matches = this.props.sync_state.matches;

		const min_convo_length = 0;

		const call_end_events : MergedEndEvent[]  = Object.entries(matches)
			.filter(([, x]) => x.history)
			.reduce((agg, [sid, curr]) => {
				// interaction between user and school - need to just keep id and name here of school
				// flatten all events, keeping match id and name as minimum extra info

				if(curr.history) {
					return [
						...agg,
						...Object.values(curr.history)
							.filter(x => x.event === "CALL_BACK_END" || x.event === "CALL_END")
							.map(x => ({
								...x,
								school_id: sid
							}))
					]
				}

				return agg;

			}, [])

		const last_unanswered_per_school = Object.values(call_end_events
			.filter(x => x.meta && matches[x.school_id].status === "IN_PROGRESS")
			.sort((a, b) => a.time - b.time)
			.reduce((agg, curr) => {
				return {
					...agg,
					[curr.school_id]: curr
				}
			}, {} as {[sid: string]: MergedEndEvent}))
			.filter(x => x.meta.call_status === "CANCEL" || (!x.meta.call_status.toLowerCase().includes("answer") && parseInt(x.meta.duration) < min_convo_length))

		const total_minutes_on_phone = call_end_events.reduce((agg, curr) => {
			if(curr.meta && !isNaN(parseInt(curr.meta.duration))) {
				return agg + parseInt(curr.meta.duration)
			}
			return agg;
		}, 0)/60.0

		const missing_surveys : MergedEndEvent[] = Object.entries(matches)
			.reduce((agg, [id, curr]) => {

				if(curr.history === undefined) {
					return agg
				}

				const last_event_key = Math.max(...Object.keys(curr.history).map(x => parseInt(x)))
				const last_event = curr.history[last_event_key]
				if((last_event.event === "CALL_END" || last_event.event === "CALL_BACK_END") && last_event.meta && last_event.meta.call_status.toLowerCase().includes("answer") && parseInt(last_event.meta.duration) > min_convo_length) {
					return [
						...agg,
						{
							...last_event,
							school_id: id
						}
					]
				}

				return agg;
			}, [])

		const clients_reached_map = call_end_events
			.filter(x => x.meta && (x.meta.call_status.toLowerCase().includes("answer") || parseInt(x.meta.duration) > 60))
			.reduce((agg, curr) => {
				return {
					...agg,
					[curr.school_id]: curr
				}
			}, {})

		const clients_reached = Object.keys(clients_reached_map).length;

		const clients_attempted = Object.keys(call_end_events.reduce((agg, curr) => {
			return {
				...agg,
				[curr.school_id]: curr
			}
		}, {})).length
		

		return <div className='home page school-info'>
			<div className="title">Home Page</div>

			{
				Object.keys(numbers).length >= 0 && <div>Please add your organizations phone numbers in <Link to="/settings">Settings</Link></div>
			}

			{
				this.state.showSurvey && <Modal>
					<CallEndSurveyComponent saveSurvey={this.saveSurvey} call_number={}/>
				</Modal>
			}

			<div className="form" style={{ width: "75%" }}>

				<div className="divider">Analytics</div>

				<div className="row">
					<label>Total Clients</label>
					<div>{Object.keys(this.props.sync_state.matches).length}</div>
				</div>

				<div className="row">
					<label>Clients Attempted</label>
					<div>{clients_attempted}</div>
				</div>
				<div className="row">
					<label>Clients Reached</label>
					<div>{clients_reached}</div>
				</div>

				<div className="row">
					<label>Calls Made</label>
					<div>{call_end_events.length}</div>
				</div>

				<div className="row">
					<label>Un-Answered Calls</label>
					<div>{call_end_events.filter(x => x.meta && !x.meta.call_status.toLowerCase().includes("answer") && parseInt(x.meta.duration) < 60 ).length}</div>
				</div>

				<div className="row">
					<label>Call Backs</label>
					<div>{call_end_events.filter(x => x.event === "CALL_BACK_END").length}</div>
				</div>

				<div className="row">
					<label>Minutes on Phone</label>
					<div>{total_minutes_on_phone.toFixed(1)}</div>
				</div>

				<div className="divider">Missed Surveys</div>
				{
					missing_surveys
						.sort((a, b) => a.time - b.time)
						.map(x => <div key={x.school_id} className="row clickable" onClick={this.onSurveyClick(x.school_id)}>
							<div>{this.props.school_db[x.school_id] ? this.props.school_db[x.school_id].school_name : "Loading..."}</div>
							<div style={{ flexShrink: 1, textAlign: "center" }}>{x.user.name}</div>
							<div style={{ flexShrink: 1 }}>{moment(x.time).format("DD/MM HH:mm")}</div>
						</div>)
				}

				<div className="divider">Unanswered Calls</div>
				{
					Object.values(last_unanswered_per_school)
						.sort((a, b) => a.time - b.time)
						.map(x => <div key={x.school_id} className="row clickable" onClick={this.onSchoolClick(x.school_id)}>
							<div>{this.props.school_db[x.school_id] ? this.props.school_db[x.school_id].school_name : "Loading..."}</div>
							<div style={{ flexShrink: 1 }}>{moment(x.time).format("DD/MM HH:mm")}</div>
						</div>)
				}
			</div>
		</div>
	}
}

type MergedEndEvent = CallEndEvent & { school_id: string }

export default connect((state : RootBankState) => ({ 
	sync_state: state.sync_state,
	school_db: state.new_school_db
}), (dispatch : Function) => ({
	saveFullState: () => dispatch(forceSaveFullStatePotentiallyCausingProblems()),
	addSchools: (ids : string[]) => dispatch(getSchoolProfiles(ids)),
	saveCallEndSurvey: (school_id: string, survey: CallEndSurvey['meta']) => dispatch(saveCallEndSurvey(school_id, survey))
}))(Home)