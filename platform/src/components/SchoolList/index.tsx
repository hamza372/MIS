import React from 'react'
import { RouteComponentProps} from 'react-router-dom'

type propTypes = {
	title: string
	status: SchoolMatch['status']
	matches: RootBankState['sync_state']['matches']
	school_db: RootBankState['new_school_db']
	connected: boolean
	addSchools: (ids : string[]) => void
} & RouteComponentProps

interface stateType {
	loading: boolean
}

export default class SchooList extends React.Component<propTypes, stateType> {

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

		const { school_db } = this.props;
		return <div className="page">

			<div className="title">{this.props.title}</div>

			{ this.state.loading && <div className="loading">Loading School Info....</div>}
			<div className="list">
			{
				Object.entries(this.props.matches)
					.filter(([id, v]) => v.status === this.props.status && this.props.school_db[id] !== undefined)
					.sort(([a,] , [b,]) => (school_db[a].school_name || "").localeCompare(school_db[b].school_name))
					.map(([sid, v]) => {
						const school = school_db[sid];

						return <div key={sid} onClick={this.onSchoolClick(school)}>
							<div>{school.school_name}</div>
						</div>
					})
			}
			</div>
		</div>
	}
}