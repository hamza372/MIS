import * as React from 'react'
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line } from 'recharts'

interface P {

}

interface DataRow {
	teachers_marked: number
	school_id: string
	date: string
}

interface S {
	data: DataRow[]
}

class TeacherAttendance extends React.Component<P, S> {

	constructor(props: P) {
		super(props);

		this.state = {
			data: []
		}
	}

	componentDidMount() {
		fetch('http://localhost:8080/dashboard/teacher_attendance')
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

		console.log("teacher-data", this.state)

		return <div>
			Hello, teacher attendance

			<ResponsiveContainer width="100%" height={500}>
				<LineChart data={this.state.data}>
					<XAxis dataKey="date" />
					<YAxis />
					<Tooltip />

					<Line dataKey="teachers_marked" />
				</LineChart>

			</ResponsiveContainer>
		</div>
	}
}

export default TeacherAttendance;