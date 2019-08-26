import React, { Component } from 'react'
import { type } from 'os';
import { RouteComponentProps } from 'react-router';
import Former from '../../../utils/former';
import Layout from '../../../components/Layout';


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
			<div className="custom-cert">
				<div className="card"> Hello I'm the custom certificate builder </div>
			</div>
		</Layout>
	}
}
