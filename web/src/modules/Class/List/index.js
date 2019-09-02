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
		.sort((a, b) => (a.classYear || 0) - (b.classYear || 0))
		.map(c => ({...c, forwardTo}))
	
	let create = '/class/new'

	if(forwardTo === 'fee-menu'){
		create = ''
	}
	if(forwardTo === 'report-menu'){
		create = '';
	}
		
	return <div className="class-module">
		<div className="title">Classes</div>
		
		<List
			items={items}
			Component={ClassItem}
			create={create} 
			createText={"Add new Class"} 
			toLabel={C => C.name} 
			/>
	</div>
}

export default connect((state, { location }) => ({
	classes: state.db.classes,
	forwardTo: qs.parse(location.search, { ignoreQueryPrefix: true }).forwardTo || "profile"
}))(LayoutWrap(ClassListModule)) 