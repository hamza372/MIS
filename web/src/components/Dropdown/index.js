import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Former from 'utils/former'

// you supply a dropdown with a callback for "selected item", a list of objects to search, and a function to get the label from that list.

import './style.css'

class Dropdown extends Component {

	constructor(props) {
		super(props);

		this.state = {
			text: ""
		}

		this.former = new Former(this, [])
	}

	render() {

		const {items, toLabel, onSelect, toKey} = this.props;

		return <div className="dropdown">

			<input type="text" {...this.former.super_handle(["text"])} placeholder={this.props.placeholder || "Enter Text"} />
			<div className="dropdown-items">
			{
				this.state.text.length === 0 ? false : items
					.filter(item => toLabel(item).toLowerCase().startsWith(this.state.text.toLowerCase()))
					.map(item => <div onClick={() => {
						onSelect(item);
						this.setState({ text: "" })
					}} key={toKey(item)}>{toLabel(item)}</div>)
			}
			</div>
		
		</div>
	}
}

Dropdown.propTypes = {
	items: PropTypes.array.isRequired,
	toLabel: PropTypes.func.isRequired,
	toKey: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired
}

export default Dropdown;