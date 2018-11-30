import React,{Component} from 'react'
import { Link } from 'react-router-dom'

import './style.css'


class List extends Component {
	constructor(props) {
		super(props)
		this.state = {
			filterText : ""
		}
	}
	onChange = (e) => {
		this.setState({filterText:e.target.value});
	}

	render() 
	{
		const {items, toLabel, Component } = this.props;
		
		const filteredList = items.filter(item => {
			return toLabel(item).toLowerCase().includes(this.state.filterText.toLowerCase());
		});

		return <div className="list-wrap">
			
			<input className="search-bar" type="text" placeholder="Search" onChange={this.onChange}/>

			{ this.props.create ? <Create to={this.props.create} text={this.props.createText} /> : false }
			
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

