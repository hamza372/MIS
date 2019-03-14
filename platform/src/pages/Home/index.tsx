import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import moment from 'moment'

import { forceSaveFullStatePotentiallyCausingProblems } from '~/src/actions'

interface propTypes {

	sync_state: RootBankState['sync_state'],
	saveFullState: () => void
}

class Home extends React.Component<propTypes> {

	render() {
		// if no number is set in auth, should ask them here

		const numbers = this.props.sync_state.numbers;

		const call_end_events : (CallEndEvent & { school_id: string })[]  = Object.entries(this.props.sync_state.matches)
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

				<div className="divider">Missed Connections</div>
				{
					call_end_events
						.filter(x => x.meta && x.meta.call_status != "ANSWER")
						.map(x => <div className="row">
							<label>{x.school_id}</label>
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

export default connect((state : RootBankState) => ({ 
	sync_state: state.sync_state
}), (dispatch : Function) => ({
	saveFullState: () => dispatch(forceSaveFullStatePotentiallyCausingProblems())
}))(Home)