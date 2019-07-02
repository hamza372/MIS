import * as React from 'react'
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line } from 'recharts'

interface P {

}

interface DataRow {
	students_marked: number
	school_id: string
	date: string
	total_students: number
}

interface S {
	data: DataRow[]
}

class StudentAttendance extends React.Component<P, S> {

	constructor(props: P) {
		super(props);

		this.state = {
			data: []
		}
	}

	componentDidMount() {
		fetch('http://localhost:8080/dashboard/student_attendance?school_id=brighterschool&start_date=2018-10-15&end_date=2018-12-19')
			.then(res => res.json())
			.then(parsed => {
				this.setState({
					data: parsed.data
				})
			})
			.catch(err => {
				console.error(err)
			})
	}

	render() {

		return <div>
			Student Attendance Module Usage
			
			<ResponsiveContainer width="100%" height={500}>
				<LineChart data={this.state.data}>
					<XAxis dataKey="date" />
					<YAxis />
					<Tooltip />

					<Line dataKey="students_marked" />
					<Line dataKey="total_students"/>
				</LineChart>

			</ResponsiveContainer>
		</div>
	}
}

export default StudentAttendance;