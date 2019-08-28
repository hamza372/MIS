import React, { Component } from 'react'
import { RouteComponentProps } from 'react-router';
import Former from '../../utils/former';
import Layout from '../../components/Layout';

import "./style.css"

interface S {

}

interface P {

}

type propTypes = RouteComponentProps & P

class Inventory extends Component < propTypes, S > {

	former: Former
	constructor(props: propTypes) {
		super(props)
	
		this.state = {
			 
		}

		this.former = new Former(this,[])
	}
	
	render() {
		return <Layout history={this.props.history}>
			<div className="inventory">

				<div className="title">Inventory</div>

				<div className="section" style={{width: "80%",overflow: "auto" }}>
					<div className="newtable">
						<div className="newtable-row heading">
							<div>Date</div>
							<div>Name</div>
							<div>Quantity</div>
							<div>Price</div>
							<div></div>
						</div>
						<div className="newtable-row">
							<div>01-12-2019</div>
							<div>Pencil</div>
							<div>50</div>
							<div>5 Rs</div>
							<div style={{ display: "flex", alignItems:"center", justifyContent:"center"}}>
								<div className="button red" style={{width: "5%"}}>Delete</div>
							</div>
						</div>
						<div className="newtable-row">
							<div>01-12-2019</div>
							<div>Pencil</div>
							<div>50</div>
							<div>5 Rs</div>
							<div style={{ display: "flex", alignItems:"center", justifyContent:"center"}}>
								<div className="button red" style={{width: "5%"}}>Delete</div>
							</div>
						</div>
						<div className="newtable-row">
							<div>01-12-2019</div>
							<div>Pencil</div>
							<div>50</div>
							<div>5 Rs</div>
							<div style={{ display: "flex", alignItems:"center", justifyContent:"center"}}>
								<div className="button red" style={{width: "5%"}}>Delete</div>
							</div>
						</div>
						<div className="newtable-row">
							<div>01-12-2019</div>
							<div>Pencil</div>
							<div>50</div>
							<div>5 Rs</div>
							<div style={{ display: "flex", alignItems:"center", justifyContent:"center"}}>
								<div className="button red" style={{width: "5%"}}>Delete</div>
							</div>
						</div>
						<div className="newtable-row">
							<div>01-12-2019</div>
							<div>Pencil</div>
							<div>50</div>
							<div>5 Rs</div>
							<div style={{ display: "flex", alignItems:"center", justifyContent:"center"}}>
								<div className="button red" style={{width: "5%"}}>Delete</div>
							</div>
						</div>
						<div className="newtable-row">
							<div>01-12-2019</div>
							<div>Pencil</div>
							<div>50</div>
							<div>5 Rs</div>
							<div style={{ display: "flex", alignItems:"center", justifyContent:"center"}}>
								<div className="button red" style={{width: "5%"}}>Delete</div>
							</div>
						</div>
						<div className="newtable-row">
							<div>01-12-2019</div>
							<div>Pencil</div>
							<div>50</div>
							<div>5 Rs</div>
							<div style={{ display: "flex", alignItems:"center", justifyContent:"center"}}>
								<div className="button red" style={{width: "5%"}}>Delete</div>
							</div>
						</div>
						<div className="newtable-row">
							<div>01-12-2019</div>
							<div>Pencil</div>
							<div>50</div>
							<div>5 Rs</div>
							<div style={{ display: "flex", alignItems:"center", justifyContent:"center"}}>
								<div className="button red" style={{width: "5%"}}>Delete</div>
							</div>
						</div>
					</div>
				</div>



				
				<div className="section form">
					<div className="divider">Add Item</div>
					<div className="row">
						<label> Name </label>
						<input type="text" placeholder="Name"/>
					</div>
					<div className="row">
						<label> Quantity </label>
						<input type="number" placeholder="Quantity"/>
					</div>
					<div className="row">
						<label> Price </label>
						<input type="number" placeholder="Price"/>
					</div>
					<div className="button save"> Add</div>
				</div>

				<div className="section form">
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
					<div className="button save"> Sell</div>
				</div>

				<div className="section form">
					<div className="divider">Update Item</div>
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
						<label>Price</label>
						<input type="number" placeholder="Price" />
					</div>
					<div className="button save"> Sell</div>
				</div>


				<div className="row" style={{ marginBottom: "5px" ,display:"flex", width:"80%", justifyContent:"space-between"}}>
					<div className="button blue">
						Add Item
					</div>
					<div className="button blue">
						Sell
					</div>
				</div>
			</div>
		</Layout>
	}
}

export default Inventory
