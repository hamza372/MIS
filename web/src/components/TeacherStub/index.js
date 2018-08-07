import React from 'react'
import Link from 'components/Link'

const TeacherStub = ({ teacher }) => {

	return <div className="teacher-stub">
		<Link to={`/teacher/${teacher.ID}`}>{teacher.name}</Link>
	</div>
}

export default TeacherStub;