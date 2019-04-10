import React,{Component} from 'react'
import { Link } from 'react-router-dom'
import Former from 'utils/former'

import './style.css'


class List extends Component {
	constructor(props) {
		super(props)
		this.state = {
			filterText : ""
		}
		this.former = new Former(this, [])
	}
	
	onChange = (e) => {
		this.setState({filterText:e.target.value});
	}

	render(){
		const {items, toLabel, Component, children } = this.props;

		const filteredList = items
			.filter(item => {
				return toLabel(item) !== undefined && toLabel(item).toLowerCase().includes(this.state.filterText.toLowerCase())
			})
			.sort((a,b) => toLabel(b).localeCompare(this.state.filterText) - toLabel(a).localeCompare(this.state.filterText))

		const header = filteredList.some(i => i.header)

		return <div className="list-wrap">
			<div className="total">
				<div className="label">
					Total: <strong> { header ? filteredList.length -1 : filteredList.length } </strong>
				</div>
				{ this.props.create ? <Create to={this.props.create} text={this.props.createText} /> : false }
			</div>
			<input className="search-bar no-print" type="text" placeholder="Search" onChange={this.onChange}/>

			{ children }
			<div className="list">
			{
				filteredList.map(item => Component(item))
			}
			
			</div>
		</div>
	}
}

const Create = ({ to, text}) => {
	return <Link className="button blue" to={to}>{text}</Link>
}

export default List;

