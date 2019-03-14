import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import moment from 'moment'

import { forceSaveFullStatePotentiallyCausingProblems, getSchoolProfiles } from '~/src/actions'

interface propTypes {

	sync_state: RootBankState['sync_state']
	school_db: RootBankState['new_school_db']
	saveFullState: () => void
	addSchools: (ids: string[]) => void
}

interface stateType {
	loading: boolean
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
			loading: blank.length > 0
		}
	}

	componentWillReceiveProps(nextProps : propTypes) {

		const blank = Object.keys(nextProps.sync_state.matches)
			.filter(k => nextProps.school_db[k] == undefined)

		this.setState({ loading: blank.length > 0 })
	}

	render() {
		// if no number is set in auth, should ask them here

		const numbers = this.props.sync_state.numbers;

		const call_end_events : MergedEndEvent[]  = Object.entries(this.props.sync_state.matches)
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

		const last_unanswered_per_school = call_end_events
			.filter(x => x.meta && x.meta.call_status !== "ANSWER")
			.sort((a, b) => a.time - b.time)
			.reduce((agg, curr) => {
				return {
					...agg,
					[curr.school_id]: curr
				}
			}, {} as {[sid: string]: MergedEndEvent})

		return <div className='home page school-info'>
			<div className="title">Home Page</div>

			{
				Object.keys(numbers).length >= 0 && <div>Please add your organizations phone numbers in <Link to="/settings">Settings</Link></div>
			}

			<div className="form" style={{ width: "75%"}}>

				<div className="divider">Analytics</div>

				<div className="row">
					<label>Calls Made</label>
					<div>{call_end_events.length}</div>
				</div>

				<div className="row">
					<label>Failed Calls</label>
					<div>{call_end_events.filter(x => x.meta && x.meta.call_status !== "ANSWER").length}</div>
				</div>

				<div className="row">
					<label>Call Backs</label>
					<div>{call_end_events.filter(x => x.event === "CALL_BACK_END").length}</div>
				</div>

				<div className="row">
					<label>Minutes on Phone</label>
					<div>{(call_end_events.reduce((agg, curr) => curr.meta ? agg + curr.meta.duration : agg, 0)/60.0).toFixed(1)}</div>
				</div>

				<div className="divider">Unanswered Calls</div>
				{
					Object.values(last_unanswered_per_school)
						.map(x => <div className="row">
							<label>{this.props.school_db[x.school_id] ? this.props.school_db[x.school_id].school_name : "Loading..."}</label>
							<div>{moment(x.time).format("DD/MM HH:MM:SS")}</div>
						</div>)
				}
			</div>



			{
				// I want to see who i called who didnt pick up the phone, when i called them, and should i call them back now
					// for this i need name and id
			}

		</div>
	}
}

type MergedEndEvent = CallEndEvent & { school_id: string }

export default connect((state : RootBankState) => ({ 
	sync_state: state.sync_state,
	school_db: state.new_school_db
}), (dispatch : Function) => ({
	saveFullState: () => dispatch(forceSaveFullStatePotentiallyCausingProblems()),
	addSchools: (ids : string[]) => dispatch(getSchoolProfiles(ids))
}))(Home)