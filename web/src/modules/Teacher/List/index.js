import React from 'react'
import { connect } from 'react-redux'
import Layout from 'components/Layout'
import List from 'components/List'
import Title from 'components/Title'
import TeacherStub from 'components/TeacherStub'


const TeacherList = (props) => {
	return <Layout>
		<div className="teacher-list">
			<Title>Teachers</Title>
			<List create={'/faculty/new'} createText={"Add new Teacher"}>
				{Object.values(props.teachers).map(teacher => <TeacherStub key={teacher.id} teacher={teacher} />)}
			</List>
		</div>
	</Layout>
}

export default connect(state => ({
	teachers: state.db.faculty //Object.entries(state.db.faculty).reduce((agg, [k, v]) => v.Admin ? agg : {...agg, [k]: v}, { })
}))(TeacherList);