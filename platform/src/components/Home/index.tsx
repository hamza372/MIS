import * as React from "react"
import { withRouter, Route, RouteComponentProps } from 'react-router-dom'
import { connect } from 'react-redux'

import { selectLocation } from '~/src/actions'

import Map from '~/src/components/DeckMap'
import Sidebar from '~/src/components/Sidebar'
import Filter from '~/src/components/Filter'


class Home extends React.Component<RouteComponentProps<any> & RootBankState & DispatchProps, any> {

	constructor(props : any) {
		super(props);

		this.state = {
			selected: undefined
		}
	}

	componentDidMount() {
		// check if we have a school id in the route.
		// if we do, then dispatch the action to set it as selected.

		const id = this.props.match.params.school_id

		if(id) {
			this.props.selectLocation({id, ...this.props.school_locations[id]})
		}
	}

	onSelect = (loc : SchoolLocation) => {
		this.props.history.push(`/school/${loc.id}`);
		this.props.selectLocation(loc)
	}

	render() {

		const filter = this.props.filter_text.toUpperCase();

		const locations = filter === "" ? this.props.school_locations : Object.entries(this.props.school_locations)
			.reduce((agg, [id, sloc]) => {
					if(sloc.SchoolName.startsWith(filter)) {
					return {
						...agg,
						[id]: sloc
					}
				}
				else {
					return agg;
				}
			}, {})

		return <div>
			Loading...
			<Filter />
			<Map onSelect={this.onSelect} school_locations={locations} />
			{ this.props.selected === undefined ? false : <Sidebar school={this.props.school_db[this.props.selected.id]} /> }
		</div>
	}
}

interface DispatchProps {
	selectLocation: (item: SchoolLocation) => void
}

export default connect((state : RootBankState) => state, (dispatch : any) => ({
	selectLocation: (item : SchoolLocation) => dispatch(selectLocation(item))
}))(withRouter(Home))