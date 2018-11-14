import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import Layout from 'components/Layout'
import List from 'components/List'
import Title from 'components/Title'
 
const TeacherItem = (T) => 
	<Link key={T.id} to={`/faculty/${T.id}/profile`}>
		{teacherLabel(T)}
	</Link>

const tableTitle = () =>{
	return	<div className="table row heading">
					<label><b>Name</b></label>
		 		</div>
}

const teacherLabel = (T) => `${T.Name}`;

const TeacherList = (props) => {
	
	const items = Object.values(props.teachers); 

	return <Layout>
		<div className="teacher-list">
			
			<Title>Teachers</Title>
			<List
				items={items}
				tableTitle={tableTitle}
				Component={TeacherItem}
				create={'/faculty/new'} 
				createText={"Add new Teacher"} 
				toLabel={teacherLabel} 
			/>
		</div>
	</Layout>
}

export default connect(state => ({
	teachers: state.db.faculty //Object.entries(state.db.faculty).reduce((agg, [k, v]) => v.Admin ? agg : {...agg, [k]: v}, { })
}))(TeacherList);