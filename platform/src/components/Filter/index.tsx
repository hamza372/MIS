import * as React from 'react'
import { connect } from 'react-redux'
import { Action } from 'redux'

import { setFilter } from '~/src/actions'

import './style.css'
import debounce from '../../utils/debounce';

interface propTypes {
	filterText: string,
	setFilter: (x: string) => void
}

class Filter extends React.Component<propTypes, {filter_text: string}> {

	constructor(props : propTypes) {
		super(props);

		this.state = {
			filter_text: ""
		}

	}

	onChange = (e : React.ChangeEvent<HTMLInputElement>) => {
		console.log('setfilter')

		this.setState({
			filter_text: e.target.value
		});

		if(e.target.value.length !== 1) {
			this.props.setFilter(e.target.value);
		}
	}

	render() {

		return <div className="filter-component">
			<input type="text" placeholder="Search School Names and Locations" onChange={this.onChange} value={this.state.filter_text} />
		</div>
	}
}

export default connect((state : RootBankState) => ({
	filterText: state.filter_text
}),
(dispatch : any) => ({
	setFilter: debounce((filterText : string) => dispatch(setFilter(filterText)), 500)
}))(Filter);