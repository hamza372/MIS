import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import Layout from 'components/Layout'
import List from 'components/List'
import Title from 'components/Title'
 
const TeacherItem = (T) => {
	return <div className="table row">
		{ !T.permission.isAdmin ?
			T.permission.profile_info_permission ? <Link key={T.id} to={`/faculty/${T.id}/profile`}>
				{T.Name}
			</Link> : <div key={T.id}>{T.Name}</div>
			: <Link key={T.id} to={`/faculty/${T.id}/profile`}>
				{T.Name}
			</Link>
		}
	</div>
}

const tableTitle = () =>{
	return	<div className="table row heading">
					<label><b>Name</b></label>
		 		</div>
}

const TeacherList = (props) => {

	const permission = { 
		isAdmin: props.admin,
		profile_info_permission: props.permissions.teacher_profile.teacher
	}
	const items = Object.values(props.teachers)
	.map(teacher => {
		return { 
			...teacher,
			permission
		} 
	});
	const create = props.admin ? '/faculty/new' : props.permissions.addTeacher.teacher ? '/faculty/new' : '';	

	return <Layout history={props.history}>
		<div className="teacher-list">
			
			<Title>Teachers</Title>
			<List
				items={items}
				tableTitle={tableTitle}
				Component={TeacherItem}
				create={create} 
				createText={"Add new Teacher"} 
				toLabel={T => T.Name}
			/>
		</div>
	</Layout>
}

export default connect(state => ({
	teachers: state.db.faculty, //Object.entries(state.db.faculty).reduce((agg, [k, v]) => v.Admin ? agg : {...agg, [k]: v}, { })
	admin: state.db.faculty[state.auth.faculty_id].Admin,
	permissions: state.db.settings.permissions,
}))(TeacherList);