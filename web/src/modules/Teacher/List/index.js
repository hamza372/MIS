import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import List from 'components/List'
import Title from 'components/Title'
import { LayoutWrap } from '../../../components/Layout';
 
const TeacherItem = (T) => 
	<Link key={T.id} to={`/faculty/${T.id}/${T.forwardTo}`}>
		{T.Name}
	</Link>

const tableTitle = () =>{
	return	<div className="table row heading">
					<label><b>Name</b></label>
		 		</div>
}

export const TeacherList = (props) => {

	let forwardTo = "profile"
	let create = '/faculty/new'

	if(props.forwardTo === "certificates"){
		forwardTo = "certificates"
		create = ""
	}

	const items = Object.entries(props.teachers)
			.filter(([,f]) => f.Name && f.id)
			.sort(([,a], [,b]) => a.Name.localeCompare(b.Name))
			.map(([id,teacher]) => {
				return {
					...teacher,
					id,
					forwardTo
				}
			})

	return <div className="teacher-list">

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
}

export default connect(state => ({
	teachers: state.db.faculty //Object.entries(state.db.faculty).reduce((agg, [k, v]) => v.Admin ? agg : {...agg, [k]: v}, { })
}))(LayoutWrap(TeacherList));