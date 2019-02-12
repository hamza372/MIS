import React from 'react'
import { connect } from 'react-redux'

import { getSchoolProfiles, reserveMaskedNumber } from '~/src/actions'

type propTypes = {
	matches: RootBankState['sync_state']['matches'],
	school_db: RootBankState['new_school_db'],
	connected: boolean,
	addSchools: (ids : string[]) => void,
	reserveNumber: (school_id: string) => void
}

interface stateType {
	selected_school?: any
}

class Home extends React.Component<propTypes, stateType> {

	constructor(props : propTypes) {
		super(props);

		this.state = {
			selected_school: undefined
		}
	}

	onSchoolClick = (school : any) => () => {
		console.log(school)

		// merge a masked number here. pretend pool is just my number
		this.props.reserveNumber(school.refcode);

	}

	render() {

		const blank = Object.keys(this.props.matches)
			.filter(k => this.props.school_db[k] == undefined)
	
		let loading = false;
		if(this.props.connected && blank.length > 0) {
			this.props.addSchools(blank)
			loading = true;
		}

		console.log(this.state.selected_school)
		return <div className="new page">

			<div className="title">New Schools</div>

			{ loading && <div className="loading">Loading School Info....</div>}
			<div className="list">
			{
				Object.entries(this.props.matches)
					.filter(([id, v]) => v.status === "NEW" && this.props.school_db[id] !== undefined)
					.map(([sid, v]) => {
						const school = this.props.school_db[sid];

						return <div key={sid} onClick={this.onSchoolClick(school)}>{school.pulled_schoolname}</div>
					})
			}
			</div>
		</div>
	}
}

export default connect((state : RootBankState) => ({
	matches: state.sync_state.matches || {},
	school_db: state.new_school_db,
	connected: state.connected
}), (dispatch : ( thing : any) => any) => ({
	addSchools: (school_ids : string[]) => dispatch(getSchoolProfiles(school_ids)),
	reserveNumber: (school_id : string) => dispatch(reserveMaskedNumber(school_id))
}))(Home)