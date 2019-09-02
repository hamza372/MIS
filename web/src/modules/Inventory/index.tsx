import React, { Component } from 'react'
import { RouteComponentProps } from 'react-router';
import Former from '../../utils/former';
import Layout from '../../components/Layout';
import { addInventoryItem, deleteInventoryItem } from '../../actions'

import "./style.css"
import moment from 'moment';
import Banner from '../../components/Banner';
import { connect } from 'react-redux';

/**
 * Inventory {
 * 		[id: string]: {
 * 				name: string
				date: number
				quantity: number
				price: number
				cost: number
 * 		}
 * }
 * 
 */

interface S {
	item: {
		name: string
		date: number
		quantity: string
		price: string
		cost: string
		discount: string
	}
	sell_item: boolean
	add_item: boolean
	banner: {
		active: boolean
		good?: boolean
		text?: string
	}
	edits: RootDBState["inventory"]
}

interface P {
	inventory: RootDBState["inventory"]
	addItem: (item: any) => any
	deleteItem: (id: string) => any
}

type propTypes = RouteComponentProps & P

class Inventory extends Component < propTypes, S > {

	mutations: {
		[id: string]: {
			
	} }
	former: Former
	constructor(props: propTypes) {
		super(props)
	
		this.state = {
			item: {
				name: "",
				date: moment.now(),
				quantity: "0",
				price: "0",
				cost: "0",
				discount: "0"
			},
			edits: JSON.parse(JSON.stringify(props.inventory || {})),
			sell_item: false,
			add_item: false,
			banner: {
				active: false,
				good: true,
				text: ""
			},
			
		}
		
		this.mutations = {}
		this.former = new Former(this,[])
	}

	additem = () => {
		
		const { date, name, quantity, price, cost, discount } = this.state.item
		
		const item = {
			date,
			name,
			quantity: parseFloat(quantity),
			price: parseFloat(price),
			cost: parseFloat(cost),
		}

		this.props.addItem(item)
		
		this.setState({
			add_item: !this.state.add_item
		})
	}

	sellItem = () => {
		this.setState({
			sell_item: !this.state.sell_item
		})
	}

	deleteItem = (id: string) => {
		if (!window.confirm("Are you sure you want to delete this item?"))
		{
			return
		}
		console.log("Deleting Item", id)
		this.props.deleteItem(id)

	}

	onSave = () => {
		console.log("Save")
		const inventory = this.props.inventory

		const changes = Object.entries(this.state.edits)
			.filter(([id, item]) =>
				item.name === inventory[id].name || 
				item.quantity === inventory[id].quantity ||
				item.price === inventory[id].price
			)
		console.log("Changes", changes)

	}

	tracker = ( id: string , path: string) => () => {

		//this.mutations[path.join(',')] = path
		console.log("MUTATIONSSSSSSS", this.mutations)
		
		this.mutations[id] = {
			...this.mutations[id],
			[path]: true
		}

	}
	
	render() {

		console.log("Edits",this.state.edits)
		console.log("Inventory",this.props.inventory)

		//const { inventory } = this.props

		const { banner } = this.state


		return <Layout history={this.props.history}>
			{banner.active && <Banner isGood={banner.good} text={banner.text} />}
			
			<div className="inventory">

				<div className="title">Inventory</div>

				<div className="section" style={{width: "80%",overflow: "auto" }}>
					<div className="newtable">
						<div className="newtable-row heading">
							<div>Date</div>
							<div>Name</div>
							<div>Quantity</div>
							<div>Price (Rs)</div>
							<div></div>
						</div>

						{
							Object.entries(this.state.edits)
								.map(([id, item]) => {
									return <div key={id} className="newtable-row">
										<div>{moment(item.date).format("DD-MM-YY")}</div>
										<div>
											<input className="newtable-input" type="text" {...this.former.super_handle(["edits", id, "name"], () => true, this.tracker(id,"name"))}/>
										</div>
										<div>
											<input className="newtable-input" type="number" {...this.former.super_handle(["edits", id, "quantity"],() => true, this.tracker(id,"quantity"))} />
										</div>
										<div>
											<input className="newtable-input" type="number" {...this.former.super_handle(["edits", id, "price"],() => true, this.tracker(id,"price"))} />
										</div>
										<div className="button-cell">
											<div className="button red" onClick={() => this.deleteItem(id)}>Delete</div>
										</div>
								</div>
								})
						}

					</div>
					<div className="button blue" style={{ marginTop: "5px" }} onClick={() => this.onSave()}> Save </div>
				</div>
				
				{ this.state.add_item && <div className="section form">
					<div className="divider">Add Item</div>
					<div className="row">
						<label> Name </label>
						<input type="text" placeholder="Name" {...this.former.super_handle(["item","name"])}/>
					</div>
					<div className="row">
						<label> Quantity </label>
						<input type="number" placeholder="Quantity" {...this.former.super_handle(["item","quantity"])}/>
					</div>
					<div className="row"> 
						<label> Cost </label>
						<input type="number" placeholder="cost" {...this.former.super_handle(["item","cost"])}/>
					</div>
					<div className="row">
						<label> Price </label>
						<input type="number" placeholder="Price" {...this.former.super_handle(["item","price"])}/>
					</div>
					<div className="button save" onClick={() => this.additem()}> Add </div>
				</div>}

				{ this.state.sell_item && <div className="section form">
					<div className="divider">Sell Item</div>
						<div className="row">
							<label> Student</label>
							<select>
								<option>Ali</option>
								<option>Ayesha</option>
								<option>Taimur</option>
								<option>Mudassir</option>
							</select>
						</div>
					<div className="row">
						<label> Select Item </label>
						<select>
							<option> Pencil  </option>
							<option> Uniform </option>
							<option> Syllabus</option>
						</select>
					</div>
					<div className="row">
						<label> Quantity </label>
						<input type="number" placeholder="Quantity"/>
					</div>
					<div className="row">
						<label> Discount </label>
						<input type="number" placeholder="Discount"/>
					</div>
					<div className="button save" onClick={() => this.sellItem()}> Sell</div>
				</div>}

				<div className="row" style={{ marginBottom: "5px" ,display:"flex", width:"80%", justifyContent:"space-between"}}>
					{ !this.state.add_item && <div className="button blue" onClick={() => this.setState({ add_item: !this.state.add_item })}>
						Add Item
					</div>}

					{ !this.state.sell_item && <div className="button blue" onClick={() => this.setState({ sell_item: !this.state.sell_item })}>
						Sell
					</div>}
				</div>
			</div>
		</Layout>
	}
}

export default connect((state: RootReducerState) => ({
	inventory: state.db.inventory
}), (dispatch: Function) => ({
	addItem: (item: any) => dispatch(addInventoryItem(item)),
	deleteItem: (id: string) => dispatch(deleteInventoryItem(id))
}))(Inventory)
