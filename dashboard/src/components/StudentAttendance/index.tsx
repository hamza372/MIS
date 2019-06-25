import * as React from 'react'

class StudentAttendance extends React.Component {

	componentDidMount() {
		fetch('http://localhost:8080/dashboard/student_attendance')
			.then(res => {
				const parsed = res.json()

				console.log(parsed)
			})
			.catch(err => {
				console.error(err)
			})
	}

	render() {
		return <div>
			Hello, student attendance

		</div>
	}
}

export default StudentAttendance;