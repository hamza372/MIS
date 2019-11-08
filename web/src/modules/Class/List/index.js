import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { LayoutWrap } from 'components/Layout'
import List from 'components/List'
import qs from 'query-string'
import {getSectionsFromClasses} from 'utils/getSectionsFromClasses';



const ClassItem = (section) => 
	<Link key={section.id} to={`/class/${section.class_id}/${section.id}/${section.forwardTo}`} className="">
		{section.namespaced_name}
	</Link>

export const ClassListModule = ({ classes, forwardTo }) => {

	const items = getSectionsFromClasses(classes)
		.sort((a, b) => (a.classYear || 0) - (b.classYear || 0))
		.map(section => ({...section, forwardTo}))
	
	let create = '/class/new'

	if(forwardTo === 'fee-menu'){
		create = ''
	}
	if(forwardTo === 'report-menu'){
		create = '';
	}
		
	return <div className="class-module">
		<div className="title">Classes/Sections</div>
		
		<List
			items={items}
			Component={ClassItem}
			create={create} 
			createText={"Add new Class"} 
			toLabel={section => section.name} 
			/>
	</div>
}

export default connect((state, { location }) => ({
	classes: state.db.classes,
	forwardTo: qs.parse(location.search, { ignoreQueryPrefix: true }).forwardTo || "profile"
}))(LayoutWrap(ClassListModule)) 