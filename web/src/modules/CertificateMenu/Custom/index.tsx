import React, { Component } from 'react'
import { RouteComponentProps } from 'react-router';
import Former from '../../../utils/former';
import Layout from '../../../components/Layout';

import "./style.css"


interface P {

}

interface S {

}

type propTypes =  RouteComponentProps & P
 
export default class Custom extends Component <propTypes, S> {

	former: Former
	constructor(props: propTypes) {
		super(props)
	
		this.state = {
		
		}

		this.former = new Former(this, [])
	}
	
	
	render() {
		return <Layout history={this.props.history}>
			<div className="custom-cert form">
				<div className="title"> Cutsome Certificates :-D :-D </div>

				<div className="section">
					<div className="row">
						<label> Certificate Title</label>
						<input type="text" />
					</div>
				</div>
			</div>
		</Layout>
	}
}
