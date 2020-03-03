import React, { useState } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { LayoutWrap } from 'components/Layout'

import List from 'components/List'
import Title from 'components/Title'
import toTitleCase from 'utils/toTitleCase'

 
const TeacherItem = (T) => 
	<Link key={T.id} to={`/faculty/${T.id}/${T.forwardTo}`}>
		{ toTitleCase (T.Name) }
	</Link>

const tableTitle = () =>{
	return	<div className="table row heading">
					<label><b>Name</b></label>
		 		</div>
}

export const TeacherList = (props) => {

	const [tag, setTag] = useState("")

	let forwardTo = "profile"
	let create = '/faculty/new'

	if(props.forwardTo === "certificates"){
		forwardTo = "certificates"
		create = ""
	}

	const tags = new Set()

	Object.values(props.teachers || {})
		.filter(f => f.id && f.Name)
		.forEach(s => {
			Object.keys(s.tags || {})
				.forEach(tag => tags.add(tag))
		})

	const items = Object.entries(props.teachers)
			.filter(([,f]) => f.Name && f.id && ( tag ? f.tags && f.tags[tag] : true))
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
				toLabel={T => T.Name} >
					<div className="row" style={{ width: "90%", justifyContent: "flex-end" }}>
						<select onChange={ (e) => setTag(e.target.value)}>
							<option value="">Select Tag</option>
							{
								[...tags.keys()]
									.map(tag => <option key={tag} value={tag}> {tag} </option>)
							}
						</select>
					</div>
			</List>
		</div>
}

export default connect(state => ({
	teachers: state.db.faculty
}))(LayoutWrap(TeacherList))