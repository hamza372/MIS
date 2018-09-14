import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import Layout from 'components/Layout'
import List from 'components/List'

class ClassModule extends Component {

	render() {
		
		return <Layout>
			<div className="class-module">
				<div className="title">Classes</div>
				<List create={'/class/new'} createText={"Add new Class"}>
				{
					Object.values(this.props.classes)
					.sort((a, b) => (b.classYear || 0) - (a.classYear || 0))
					.map(x => <Link to={`/class/${x.id}`} key={x.id}>{x.name}</Link>)
				}
				</List>
			</div>
		</Layout>
	}
}

export default connect(state => ({
	classes: state.db.classes
}))(ClassModule)