import React from 'react'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps} from 'react-router-dom'

import { getSchoolProfiles } from '~/src/actions'

import SchooList from '~/src/components/SchoolList';

export default connect((state : RootBankState) => {
	return {
		matches: state.sync_state.matches || {},
		school_db: state.new_school_db,
		connected: state.connected,
		title: "In Progress",
		status: "IN_PROGRESS"
	}
}, (dispatch : ( thing : any) => any) => ({
	addSchools: (school_ids : string[]) => dispatch(getSchoolProfiles(school_ids)),
}))( withRouter(SchooList))