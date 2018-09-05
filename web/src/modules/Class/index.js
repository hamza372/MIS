import React, { Component } from 'react'
import { connect } from 'react-redux'

import Layout from 'components/Layout'
import List from 'components/List'

class ClassModule extends Component {

	render() {
		console.log(this.props)
		const unique_classes =  Object.values(this.props.sections)
			.reduce((agg, curr) => {
				// get all unique classes
				return agg[curr.class] === undefined ? 
					{ ...agg, [curr.class]: 1 } : agg
			}, {});
		
		return <Layout>
			<div className="class-module">
				<List create={'/class/new'} createText={"Add new Class"}>
				{
					Object.keys(unique_classes).map(x => <div>{x}</div>)
				}
				</List>
			</div>
		</Layout>
	}
}

export default connect(state => ({
	sections: state.db.sections
}))(ClassModule)