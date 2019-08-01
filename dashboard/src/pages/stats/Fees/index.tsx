import * as React from 'react'
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line } from 'recharts'

import '../style.css'

interface P {

}

interface DataRow {
    unique_students: number
    total: number
    school_id: string
    num_payments: number
	date: string
}

interface S {
	data: DataRow[]
}

class Fees extends React.Component<P, S> {

	constructor(props: P) {
		super(props);

		this.state = {
			data: []
		}
	}

	componentDidMount() {
		fetch('http://localhost:8080/dashboard/fees')
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

		return <div className="stat-card">
			<ResponsiveContainer width="90%" height={300}>
				<LineChart data={this.state.data}>
					<XAxis dataKey="date" />
					<YAxis />
					<Tooltip />

					<Line dataKey="num_payments" />
				</LineChart>

			</ResponsiveContainer>
		</div>
	}
}

export default Fees;