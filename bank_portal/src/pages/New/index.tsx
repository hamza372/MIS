import React from 'react'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps} from 'react-router-dom'

import { getSchoolProfiles } from '~/src/actions'

type propTypes = {
	matches: RootBankState['sync_state']['matches'],
	school_db: RootBankState['new_school_db'],
	connected: boolean,
	addSchools: (ids : string[]) => void
} & RouteComponentProps

class Home extends React.Component<propTypes> {

	onSchoolClick = (school : CERPSchool) => () => {
		console.log(school)

		this.props.history.push({
			pathname: this.props.location.pathname,
			search: `?school_id=${school.refcode}`
		})
	}

	render() {

		const blank = Object.keys(this.props.matches)
			.filter(k => this.props.school_db[k] == undefined)
	
		let loading = false;
		if(this.props.connected && blank.length > 0) {
			this.props.addSchools(blank)
			loading = true;
		}

		return <div className="new page">

			<div className="title">New Schools</div>

			{ loading && <div className="loading">Loading School Info....</div>}
			<div className="list">
			{
				Object.entries(this.props.matches)
					.filter(([id, v]) => v.status === "NEW" && this.props.school_db[id] !== undefined)
					.map(([sid, v]) => {
						const school = this.props.school_db[sid];

						return <div key={sid} onClick={this.onSchoolClick(school)}>{school.school_name}</div>
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
}))( withRouter(Home))