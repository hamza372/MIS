import * as React from 'react'
import { connect } from 'react-redux'

import { setFilter } from '~/src/actions'

import './style.css'

class Filter extends React.Component<{filterText: string, setFilter: (x : string) => void}> {

	onChange = (e : React.ChangeEvent<HTMLInputElement>) => {
		this.props.setFilter(e.target.value);
	}

	render() {

		return <div className="filter-component">
			<input type="text" placeholder="Search School Names and Locations" onChange={this.onChange} value={this.props.filterText} />
		</div>
	}
}

export default connect((state : RootBankState) => ({
	filterText: state.filter_text
}),
dispatch => ({
	setFilter: (filterText : string) => dispatch(setFilter(filterText))
}))(Filter);