import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import Layout from 'components/Layout'
import List from 'components/List'
import Title from 'components/Title'


const TeacherList = (props) => {
	return <Layout>
		<div className="teacher-list">
			<Title>Teachers</Title>
			<List create={'/faculty/new'} createText={"Add new Teacher"}>
				{Object.values(props.teachers).map(teacher => <Link key={teacher.id} to={`/faculty/${teacher.id}/profile`}>{teacher.Name}</Link>)} 
			</List>
		</div>
	</Layout>
}

export default connect(state => ({
	teachers: state.db.faculty //Object.entries(state.db.faculty).reduce((agg, [k, v]) => v.Admin ? agg : {...agg, [k]: v}, { })
}))(TeacherList);