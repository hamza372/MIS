import React from 'react'
import Link from 'components/Link'

const TeacherStub = ({ teacher }) => {

	return <div className="teacher-stub">
		<Link to={`/faculty/${teacher.id}`}>{teacher.Name}</Link>
	</div>
}

export default TeacherStub;