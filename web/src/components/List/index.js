import React,{Component} from 'react'
import { Link } from 'react-router-dom'

import './style.css'


class List extends Component {
	constructor(props) {
		super(props)
		
		this.state = {
			items: [],
		}
	}
	
	filterlist = (e) => { 

		const updatedList = this.props.children.filter((item) => {
			//console.log(item);
			return item.props.children.toLowerCase().search(e.target.value.toLowerCase())!== -1;
		});
		//console.log(updatedList)
		this.setState({items : updatedList});
	}

	componentDidMount(){
		let items = this.props.children; 
		this.setState({ items });
		//console.log(items);
	}

	render() {
		return <div className="list-wrap">
			<input type="text" placeholder="Search" onChange={this.filterlist}/>

			{ this.props.create ? <Create to={this.props.create} text={this.props.createText} /> : false }
			
			<div className="list">
				{
					this.state.items.map(C => <div className="list-row" key={Math.random()}>{C}</div>)
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

