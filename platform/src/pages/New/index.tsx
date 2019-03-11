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

interface stateType {
	loading: boolean
}

class Home extends React.Component<propTypes, stateType> {

	constructor(props : propTypes) {
		super(props)

		const blank = Object.keys(props.matches)
			.filter(k => props.school_db[k] == undefined)
		
		console.log("BLANK SCHOOLS: ", blank)
		if(blank.length > 0) {
			props.addSchools(blank)
		}

		this.state = {
			loading: blank.length > 0
		}

	}

	onSchoolClick = (school : CERPSchool) => () => {
		this.props.history.push({
			pathname: this.props.location.pathname,
			search: `?school_id=${school.refcode}`
		})
	}

	componentWillReceiveProps(nextProps : propTypes) {

		const blank = Object.keys(nextProps.matches)
			.filter(k => nextProps.school_db[k] == undefined)

		console.log("NEW PROPS: ", blank)
		this.setState({ loading: blank.length > 0 })
	}


	render() {

		return <div className="new page">

			<div className="title">New Schools</div>

			{ this.state.loading && <div className="loading">Loading School Info....</div>}
			<div className="list">
			{
				Object.entries(this.props.matches)
					.filter(([id, v]) => v.status === "NEW" && this.props.school_db[id] !== undefined)
					.map(([sid, v]) => {
						const school = this.props.school_db[sid];

						return <div key={sid} onClick={this.onSchoolClick(school)}>
							<div>{school.school_name}</div>
						</div>
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