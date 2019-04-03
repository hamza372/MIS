import React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router-dom'

import { getSchoolProfiles } from '~/src/actions'

type propTypes = {
	title: string
	schools: { [id: string]: CERPSchool }
	mask_pairs: RootBankState['sync_state']['mask_pairs']
	getSchoolProfiles: (school_ids: string[]) => void
} & RouteComponentProps;

export default class MatchList extends React.Component<propTypes> {

	onSchoolClick = (school : CERPSchool) => () => {
		this.props.history.push({
			pathname: this.props.location.pathname,
			search: `?school_id=${school.refcode}`
		})
	}

	componentWillReceiveProps(nextProps : propTypes) {
		// check if the school is in db, if not load it

		const blank = Object.keys(this.props.schools)
			.filter(k => this.props.schools[k] == undefined)
		
		if(blank.length > 0) {
			this.props.getSchoolProfiles(blank)
		}
	}

	render() {

		return <div className="in-progress page">

			<div className="title">{this.props.title}</div>

			<div className="list">
			{
				Object.values(this.props.schools)
					.sort((a, b) => (a.school_name || "").localeCompare(b.school_name))
					.map(s => <div key={s.refcode} onClick={this.onSchoolClick(s)}>{s.school_name}</div>)
			}
			</div>
		</div>
	}
}