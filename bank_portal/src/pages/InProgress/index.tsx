import React from 'react'
import { connect } from 'react-redux'

import { getSchoolProfiles } from '~/src/actions'

interface propTypes {
	schools: { [id: string]: CERPSchool }
	mask_pairs: RootBankState['sync_state']['mask_pairs']
	getSchoolProfiles: (school_ids: string[]) => void
}

class InProgress extends React.Component<propTypes> {

	componentWillReceiveProps(nextProps : propTypes) {
		// check if the school is in db, if not load it

	}

	render() {

		return <div className="in-progress page">
			<div className="title">In Progress</div>

			<div className="list">
			{
				Object.values(this.props.schools)
					.map(s => <div className="">{s.school_name}</div>)
			}
			</div>

		</div>
	}
}

export default connect((state : RootBankState) => {

	const schools = Object.entries(state.sync_state.matches)
		.filter(([,x]) => x.status === "IN_PROGRESS")
		.reduce((agg, [id,]) => ({
			...agg,
			[id]: state.new_school_db[id]
		}), {})

	return {
		schools
	}
}, (dispatch : Function) => ({
	getSchoolProfiles: (school_ids: string[]) => dispatch(getSchoolProfiles(school_ids))
}))(InProgress)