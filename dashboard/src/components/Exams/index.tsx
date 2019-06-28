import * as React from 'react'
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line } from 'recharts'

interface P {

}

interface DataRow {
	students_graded: number
    school_id: number
    exams: number
	date: string
}

interface S {
	data: DataRow[]
}

class Exams extends React.Component<P, S> {

	constructor(props: P) {
		super(props);

		this.state = {
			data: []
		}
	}

	componentDidMount() {
		fetch('http://localhost:8080/dashboard/exams')
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
			Hello, exams

			<ResponsiveContainer width="100%" height={500}>
				<LineChart data={this.state.data}>
					<XAxis dataKey="date" />
					<YAxis />
					<Tooltip />

					<Line dataKey="exams" />
				</LineChart>

			</ResponsiveContainer>
		</div>
	}
}

export default Exams;