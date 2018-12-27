import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { LayoutWrap } from 'components/Layout'
import List from 'components/List'
import qs from 'query-string'



const ClassItem = (C) => {

	console.log("CLASS_ID", C.id)
 return <div className="table row">	
	{ !C.permission.isAdmin ? 
		C.permission.profile_info_permission ? <Link key={C.id} to={`/class/${C.id}/${C.forwardTo}`} className="">
			{C.name}
		</Link> : <div key={C.id}> {C.name} </div> 
	  : <Link key={C.id} to={`/class/${C.id}/${C.forwardTo}`} className="">
			{C.name}
		</Link>
	}
	</div>
}
export const ClassListModule = ({ classes, forwardTo, permissions, admin }) => {

	const permission = {
		isAdmin: admin,
		profile_info_permission: permissions.class_profile.teacher
	 }
	const items = Object.values(classes)
		.sort((a, b) => (a.classYear || 0) - (b.classYear || 0))
		.map(c => ({...c, forwardTo, permission}))
	
		let create = admin ? '/class/new' : permissions.addClass.teacher ? '/class/new' : '';

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
	admin: state.db.faculty[state.auth.faculty_id].Admin,
	permissions: state.db.settings.permissions,
	forwardTo: qs.parse(location.search, { ignoreQueryPrefix: true }).forwardTo || "profile"
}))(LayoutWrap(ClassListModule)) 