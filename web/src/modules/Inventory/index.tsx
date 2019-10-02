import React, { Component } from 'react'
import { RouteComponentProps } from 'react-router';
import Former from '../../utils/former';
import Layout from '../../components/Layout';
import { addInventoryItem, deleteInventoryItem, editInventoryItems, sellInventoryItem, mergeExam } from '../../actions'

import "./style.css"
import moment from 'moment';
import Banner from '../../components/Banner';
import { connect } from 'react-redux';
import { v4 } from 'node-uuid';

/**
 * Inventory {
 * 		[id: string]: {
 * 			date: number
			name: string
			quantity: number
			price: number
			cost: number
			expense_id: string
			sales: {
				[date: string]: {
					cost: number
					quantity: number
					date: number
					price: number
					discount: number
				}
			}
 * 		}
 * }
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
	sale: {
		student_id: string
		item_id: string
		quantity: string
		discount: string
		paid_amount: string
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
	students: RootDBState["students"]
	addItem: (item: MISInventoryItem) => any
	deleteItem: (id: string ) => any
	sellItem: (sale: MISItemSale, item: MISInventoryItem) => any
	editItem: (merges : MISMerge[]) => any
}

type propTypes = RouteComponentProps & P

class Inventory extends Component < propTypes, S > {

	mutations: {
		[id: string]: {
			price: boolean
			quantity: boolean
			name: boolean
		}
	}
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
			sale: {
				student_id: "",
				item_id: "",
				quantity: "0",
				discount: "0",
				paid_amount: "0"
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

	componentWillReceiveProps (newProps: propTypes) {
		this.setState({
			edits: JSON.parse(JSON.stringify(newProps.inventory || {}))
		})
	}

	additem = () => {
		
		const { date, name, quantity, price, cost, discount } = this.state.item
		
		const item: MISInventoryItem = {
			date,
			name,
			quantity: parseFloat(quantity),
			price: parseFloat(price),
			cost: parseFloat(cost),
			expense_id: v4(),
			sales: {}
		}

		this.props.addItem(item)

		this.setState({
			item: {
				...this.state.item,
				name: "",
				quantity: "0",
				price: "0",
				cost: "0",
				discount: "0"
			},
			add_item: !this.state.add_item,
			banner: {
				active: true,
				good: true,
				text: "Saved"
			}
		})

		setTimeout(() => {
			this.setState({
				banner: {
					active: false
				}
			})
		}, 2000)
	}

	sellItem = () => {

		if (!this.state.sale.item_id || !this.state.sale.student_id) {
			
			console.log("Not all required fields selected")
			return
		}

		const sale = {
			...this.state.sale,
			paid_amount: parseFloat(this.state.sale.paid_amount || "0"),
			quantity: parseFloat(this.state.sale.quantity || "0"),
			discount: parseFloat(this.state.sale.discount || "0")
		}

		
		this.props.sellItem(sale, this.props.inventory[sale.item_id])

		this.setState({
			sale: {
				student_id: "",
				item_id: "",
				quantity: "0",
				discount: "0",
				paid_amount: "0"
			},
			sell_item: !this.state.sell_item,
			banner: {
				active: true,
				good: true,
				text: "Saved"
			}
		})

		setTimeout(() => {
			this.setState({
				banner: {
					active: false
				}
			})
		}, 2000)

	}

	deleteItem = (id: string) => {
		if (!window.confirm("Are you sure you want to delete this item?"))
		{
			return
		}

		this.props.deleteItem(id)

		this.setState({
			banner: {
				active: true,
				good: true,
				text: "Saved"
			}
		})

		setTimeout(() => {
			this.setState({
				banner: {
					active: false
				}
			})
		}, 2000);

	}

	onSave = () => {

		const changes = Object.entries(this.mutations)
			.reduce((agg, [id, curr]) => {

				const curr_item = this.state.edits[id] as any

				const merges = Object.keys(curr)
					.reduce((agg, curr) => {

						//@ts-ignore
						const value = curr === "name" ? curr_item[curr] : parseFloat(curr_item[curr])

						return [
							...agg,
							{
								path: ["db", "inventory", id, curr],
								value
							}
						]
					}, [])
				
				const cost_id = v4()

				const costMerges = Object.keys(curr)
					.reduce((agg, curr) => {

						if (curr === "quantity" && curr_item.quantity > this.props.inventory[id].quantity) {

							return [
								...agg,
								{
									path: ["db", "expenses", cost_id],
									value: {
										expense: "MIS_EXPENSE",
										amount: parseFloat(curr_item.cost),
										label: curr_item.name,
										type: "PAYMENT_GIVEN",
										category: "INVENTORY",
										date: curr_item.date,
										time: moment.now(),
										quantity: parseFloat(curr_item.quantity) - this.props.inventory[id].quantity,
									}
								}
							]
						}

						return agg
					}, [])

				return [...agg, ...merges, ...costMerges ]
				
			}, [])
		
		this.setState({
			banner: {
				active: true,
				good: true,
				text: "Saved"
			}
		})

		setTimeout(() => {
			this.setState({
				banner: {
					active: false
				}
			})
		}, 2000);
		
		this.props.editItem(changes)

	}

	tracker = ( id: string , name: string) => () => {
		
		this.mutations[id] = {
			...this.mutations[id],
			[name]: true
		}
	}

	cancel = (type: string) => {
		if (type === "Sale")
		{
			this.setState({
				sale: {
					student_id: "",
					item_id: "",
					quantity: "0",
					discount: "0",
					paid_amount: "0"
				},
				sell_item: !this.state.sell_item
			})	
		}
		else if (type === "Add")
		{
			this.setState({
				item: {
					...this.state.item,
					name: "",
					quantity: "0",
					price: "0",
					cost: "0",
					discount: "0"
				},
				add_item: !this.state.add_item
			})
		}
	}
	
	render() {

		const { banner } = this.state
		const { inventory, students} = this.props

		const student_list = Object.values(students).filter(s => s.Name && s.Active)
		const item_list = Object.entries(inventory).map(([id, item]) => ({ id, ...item }))
		
		const changes = Object.keys(this.mutations).length > 0

		return <Layout history={this.props.history}>
			{banner.active && <Banner isGood={banner.good} text={banner.text} />}
			
			<div className="inventory">

				<div className="title">Inventory</div>

				<div className="section" style={{width: "80%",overflow: "auto" }}>
					<div className="newtable">
						<div className="newtable-row heading">
							<div>Name</div>
							<div>Quantity</div>
							<div>Price (Rs)</div>
							<div>Cost (Rs)</div>
							<div></div>
						</div>

						{
							Object.entries(this.state.edits)
								.map(([id, item]) => {
									return <div key={id} className="newtable-row">
										<div>
											<input className="newtable-input" type="text" {...this.former.super_handle(["edits", id, "name"], () => true, this.tracker(id,"name"))}/>
										</div>
										<div>
											<input className="newtable-input" type="number" {...this.former.super_handle(["edits", id, "quantity"], () => true, this.tracker(id,"quantity"))} />
										</div>
										<div>
											<input className="newtable-input" type="number" {...this.former.super_handle(["edits", id, "price"], () => true, this.tracker(id,"price"))} />
										</div>
										<div>
											<input className="newtable-input" type="number" {...this.former.super_handle(["edits", id, "cost"], () => true, this.tracker(id,"cost"))} />
										</div>
										<div className="button-cell">
											<div className="button red" onClick={() => this.deleteItem(id)}>Delete</div>
										</div>
								</div>
								})
						}

					</div>
					{ item_list.length > 0 && changes && <div className="button blue" style={{ marginTop: "5px" }} onClick={() => this.onSave()}> Save </div>}
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
					<div className="save-delete">
						<div className="button red" onClick={() => this.cancel("Add")}> Cancel </div>
						<div className="button blue" onClick={() => this.additem()}> Add </div>
					</div>
				</div>}

				{ this.state.sell_item && <div className="section form">
					<div className="divider">Sell Item</div>
						<div className="row">
							<label> Student</label>
							<select {...this.former.super_handle(["sale","student_id"])}>
								<option value="">Select</option>
							{
								student_list
									.map(s => <option key={s.id} value={s.id}> {`${s.Name} - ${s.ManName}`} </option>)
							}
							</select>
						</div>
					<div className="row">
						<label> Select Item </label>
						<select {...this.former.super_handle(["sale", "item_id"])}>
							<option value=""> Select </option>
							{
								item_list
									.map(i => <option key={i.id} value={i.id}>{i.name} </option>)
							}
						</select>
					</div>
					<div className="row">
						<label> Quantity </label>
						<input type="number" placeholder="Quantity" {...this.former.super_handle_flex(["sale", "quantity"],{ 
									styles: (val : any) => { return parseFloat(val) >  (inventory[this.state.sale.item_id] ? inventory[this.state.sale.item_id].quantity : 0) ? { borderColor : "#fc6171" } : {} } 
								})}/>
					</div>
					<div className="row">
						<label> Amount Received </label>
						<input type="number" placeholder="Amount Received" {...this.former.super_handle(["sale", "paid_amount"])}/>
					</div>
					<div className="row">
						<label> Discount </label>
						<input type="number" placeholder="Discount" {...this.former.super_handle(["sale", "discount"])}/>
					</div>
					 <div> 
						<label>Total Price</label>
						<label> {(( this.state.sale.item_id ? inventory[this.state.sale.item_id].price : 0) - parseFloat(this.state.sale.discount)) * parseFloat(this.state.sale.quantity)}</label>
					</div> 
					<div className="save-delete">
						<div className="button red" onClick={() => this.cancel("Sale")}> Cancel</div>
						<div className="button save" onClick={() => this.sellItem()}> Sell</div>
					</div>
				</div>}

				<div className="row" style={{ marginBottom: "5px" ,display:"flex", width:"80%", justifyContent:"space-between"}}>
					{ !this.state.add_item && !this.state.sell_item && <div className="button blue" onClick={() => this.setState({ add_item: !this.state.add_item })}>
						Add Item
					</div>}

					{ !this.state.sell_item && !this.state.add_item && <div className="button blue" onClick={() => this.setState({ sell_item: !this.state.sell_item })}>
						Sell
					</div>}
				</div>
			</div>
		</Layout>
	}
}

export default connect((state: RootReducerState) => ({
	inventory: state.db.inventory,
	students: state.db.students
}), (dispatch: Function) => ({
	addItem: (item: MISInventoryItem) => dispatch(addInventoryItem(item)),
	deleteItem: (id: string ) => dispatch(deleteInventoryItem(id)),
	editItem: (merges: MISMerge[]) => dispatch(editInventoryItems(merges)),
	sellItem: (sale: MISItemSale, item: MISInventoryItem) => dispatch(sellInventoryItem(sale, item))
}))(Inventory)
