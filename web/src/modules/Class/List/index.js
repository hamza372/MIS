import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { LayoutWrap } from 'components/Layout'
import List from 'components/List'
import qs from 'query-string'
import {getSectionsFromClasses} from 'utils/getSectionsFromClasses';



const ClassItem = (c) => {
	return <Link key={c.id} to={`/class/${c.id}/${c.forwardTo}`}>
			{c.name}
		</Link>
}

const SectionItem = (section) => {
	return <Link key={section.id} to={`/class/${section.class_id}/${section.id}/${section.forwardTo}`}>
			{section.namespaced_name}
		</Link>
}

export const ClassListModule = ({ classes, forwardTo }) => {

	let items = Object.values(classes)
		.sort((a, b) => (a.classYear || 0) - (b.classYear || 0))
		.map(c => ({...c, forwardTo}))
	
	let create = '/class/new'
	let createText = 'Add new class'

	if(forwardTo === 'fee-menu') {
		create = '/fees/manage'
		createText = "Manage Fees"
	}

	if(forwardTo === 'report-menu'){
		create = '';
		items = getSectionsFromClasses(classes)
			.sort((a, b) => (a.classYear || 0) - (b.classYear || 0))
			.map(section => ({...section, forwardTo}))
	}
		
	return <div className="class-module">
		<div className="title">Classes</div>
		
		<List
			items={items}
			Component={forwardTo === "report-menu" ? SectionItem : ClassItem}
			create={create} 
			createText={createText} 
			toLabel={c => {return c.name !== undefined ? c.name : c.namespaced_name}} 
			/>
	</div>
}

export default connect((state, { location }) => ({
	classes: state.db.classes,
	forwardTo: qs.parse(location.search, { ignoreQueryPrefix: true }).forwardTo || "profile"
}))(LayoutWrap(ClassListModule)) 