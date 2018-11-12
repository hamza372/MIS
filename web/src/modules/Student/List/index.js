import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import Layout from 'components/Layout'
import List from 'components/List'
import Title from 'components/Title'


const StudentItem = (S) => 
	<Link to={`/student/${S.id}/profile`} key={S.id}>
		{studentLabel(S)}
	</Link>

const studentLabel = (S) => `${S.Name}`;

const StudentList = (props) => {

	const items = Object.values(props.students)
	.sort(([,a], [,b]) => a.Name.localeCompare(b.Name))
	.map(([id, student]) => ({...student,id}));

	return <Layout>
		<div className="student-list">
			<Title>Students</Title>
			<List 
				items={items}
				Component={StudentItem}
				create={'/student/new'} 
				createText={"Add new Student"} 
				toLabel={studentLabel} 
				/> 
		</div>
	</Layout>
}

export default connect(state => {
	return { students: Object.entries(state.db.students) }
})(StudentList);