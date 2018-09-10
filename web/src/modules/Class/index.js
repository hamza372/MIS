import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import Layout from 'components/Layout'
import List from 'components/List'

class ClassModule extends Component {

	render() {
		console.log(this.props)
		/*
		const unique_classes =  Object.values(this.props.sections)
			.reduce((agg, curr) => {
				// get all unique classes
				return agg[curr.class] === undefined ? 
					{ ...agg, [curr.class]: 1 } : agg
			}, {});
		*/
		
		return <Layout>
			<div className="class-module">
				<div className="title">Classes</div>
				<List create={'/class/new'} createText={"Add new Class"}>
				{
					Object.values(this.props.classes).map(x => <Link to={`/class/${x.id}`} key={x.id}>{x.name}</Link>)
				}
				</List>
			</div>
		</Layout>
	}
}

export default connect(state => ({
	classes: state.db.classes
}))(ClassModule)