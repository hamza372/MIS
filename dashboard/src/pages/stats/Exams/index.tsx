import * as React from 'react'
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line } from 'recharts'

import '../style.css'

interface P {
	school_id: string
	start_date: string
	end_date: string
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

		const {school_id, start_date, end_date } = this.props
		
		fetch(`http://localhost:8080/dashboard/exams?school_id=${school_id}&start_date=${start_date}&end_date=${end_date}`)
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

	componentWillReceiveProps (newProps: P) {

		const {school_id, start_date, end_date } = newProps

		fetch(`http://localhost:8080/dashboard/exams?school_id=${school_id}&start_date=${start_date}&end_date=${end_date}`)
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
/* 		console.log("Exam Data",this.state.data)
 */		return <div className="stat-card">
			
			<ResponsiveContainer width="90%" height={300}>
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