import React from 'react'
import { connect } from 'react-redux'
import Layout from 'components/Layout'
import List from 'components/List'
import Title from 'components/Title'
import TeacherStub from 'components/TeacherStub'


// list view should take list of items
// i usually want to put a "create new" button as the first list entry. 
// that create new button should dispatch an action for "create new" with some defaults. when that completes, i need to navigate to that entries page.
// that means i need the ID for that newly created entity, and the entity type. `/entity-type/entity-id`

// OR I could go to /entity-type/new, which will dispatch the action upon save...

const TeacherList = (props) => {
	return <Layout>
		<div className="teacher-list">
			<Title>Teachers</Title>
			<List create={'/teacher/new'} createText={"Add new Teacher"}>
				{Object.values(props.teachers).map(teacher => <TeacherStub key={teacher.id} teacher={teacher} />)}
			</List>
		</div>
	</Layout>
}

export default connect(state => state)(TeacherList);