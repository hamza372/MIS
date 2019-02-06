import React from 'react'
import { connect } from 'react-redux'

import { getSchoolProfiles } from '~/src/actions'

type propTypes = {
	matches: RootBankState['sync_state']['matches'],
	school_db: RootBankState['new_school_db'],
	addSchools: (ids : string[]) => void,
	connected: boolean
}

class Home extends React.Component<propTypes> {

	render() {

		console.log("STUFF", this.props.matches)

		const blank = Object.keys(this.props.matches)
			.filter(k => this.props.school_db[k] == undefined)
	
		if(this.props.connected && blank.length > 0) {
			setTimeout(() => {
				this.props.addSchools(blank)
			}, 2000)
		}

		return <div className="home page">
			Home page

			<div className="list">
			{
				Object.entries(this.props.matches)
					.filter(([id, v]) => v.status === "NEW" && this.props.school_db[id] !== undefined)
					.map(([sid, v]) => {
						const school = this.props.school_db[sid];

						return <div key={sid}>{school.pulled_schoolname}</div>
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
	addSchools: (school_ids : string[]) => dispatch(getSchoolProfiles(school_ids))
}))(Home)