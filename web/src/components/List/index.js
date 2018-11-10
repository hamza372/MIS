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
	
	getLabel = (item) => {
		return item.props.children;
	}

	onChange = (e) => {
		this.setState({filterText:e.target.value});
	}

	render() {

		const filteredList = this.props.children.filter(item => {
			return this.getLabel(item).toLowerCase().includes(this.state.filterText.toLowerCase());
		})
		
		return <div className="list-wrap">
			<input className="search-bar" type="text" placeholder="Search" onChange={this.onChange}/>

			{ this.props.create ? <Create to={this.props.create} text={this.props.createText} /> : false }
			
			<div className="list">
				{
					filteredList.map(C => <div className="list-row" key={Math.random()}>{C}</div>)
				}
			</div>
		</div>
	}
}

export const Create = ({ to, text}) => {
	return <Link className="button" to={to}>{text}</Link>
}

export default List;

/* const List = (props) => {

	let updatedList = this.props.children;
	return <div className="list-wrap">
		<input type="text" placeholder="Search" onChange={this.filterlist}/>
		{ props.create ? <Create to={props.create} text={props.createText} /> : false }
		<div className="list">
			{
				props.children.map(C => <div className="list-row" key={Math.random()}>{C}</div>)
			}
		</div>
	</div>
} */

