import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import Layout from 'components/Layout'
import List from 'components/List'
import Title from 'components/Title'


const StudentList = (props) => {
	return <Layout>
		<div className="student-list">
			<Title>Students</Title>
			<List create={'/student/new'} createText={"Add new Student"}>
				{Object.values(props.students).map(([id, student]) => {

					return <Link to={`/student/${student.id}/profile`} key={student.id}>{student.Name}</Link>
				} )} 
			</List>
		</div>
	</Layout>
}

export default connect(state => {
	return { students: Object.entries(state.db.students) }
})(StudentList);