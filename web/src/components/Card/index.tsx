import React,{Component} from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import Former from '../../utils/former'

import './style.css'

interface P {
	items: Array<any>
	Component: Function
	create: string
	createText: string
	toLabel: Function
}

interface S {
	filterText: string
}

interface Routeinfo {
	id : string
}

type propTypes = RouteComponentProps<Routeinfo> & P

export default class Card extends Component <propTypes, S> {

	former : Former
	constructor(props : propTypes) {
		super(props)
		this.state = {
			filterText : ""
		}
		this.former = new Former(this, [])
	}
	
	onChange = (e : any) => {
		this.setState({filterText:e.target.value});
	}
	
	create = ({ to , text} : { to: string, text: string} ) => {
		return <Link className="button blue" to={to}>{text}</Link>
	}

	render(){
		const {items, toLabel, Component, children } = this.props;

		const filteredList = items
			.filter(item => {
				return toLabel(item) !== undefined && toLabel(item).toLowerCase().includes(this.state.filterText.toLowerCase())
			})
			.sort((a,b) => toLabel(b).localeCompare(this.state.filterText) - toLabel(a).localeCompare(this.state.filterText))

		return <div className="card-wrap">

			<div className="total">
				<div className="label">
					Total: <strong> {filteredList.length} </strong>
				</div>
				{ this.props.create ? <this.create to={this.props.create} text={this.props.createText} /> : false }
			</div>

			<input className="search-bar no-print" type="text" placeholder="Search" onChange={this.onChange}/>

			{ children }

			<div className="card-list">
			{
				filteredList.map(item => Component(item) )
			}
			</div>
		</div>
	}

}