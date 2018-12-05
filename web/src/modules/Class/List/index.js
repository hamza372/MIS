import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { LayoutWrap } from 'components/Layout'
import List from 'components/List'
import qs from 'query-string'



const ClassItem = (C) => 
	<Link key={C.id} to={`/class/${C.id}/${C.forwardTo}`} className="">
		{C.name}
	</Link>

export const ClassListModule = ({ classes, forwardTo }) => {

	const items = Object.values(classes)
		.sort((a, b) => (b.classYear || 0) - (a.classYear || 0))
		.map(c => ({...c, forwardTo}))
	
	return <div className="class-module">
		<div className="title">Classes</div>
		
		<List
			items={items}
			Component={ClassItem}
			create={'/class/new'} 
			createText={"Add new Class"} 
			toLabel={C => C.name} 
			/>
	</div>
}

export default connect((state, { location }) => ({
	classes: state.db.classes,
	forwardTo: qs.parse(location.search, { ignoreQueryPrefix: true }).forwardTo || "profile"
}))(LayoutWrap(ClassListModule))