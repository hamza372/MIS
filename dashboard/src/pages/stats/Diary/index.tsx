import * as React from 'react'
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts'

import '../style.css'
import { getEndPointResource } from '../../../utils/getEndPointResource';

interface P {
	school_id: string
	start_date: string
	end_date: string
}

interface DataRow {
	teachers_marked: number
	school_id: string
	date: string
}

interface S {
	data: DataRow[]
}

class Diary extends React.Component<P, S> {

	constructor(props: P) {
		super(props);

		this.state = {
			data: []
		}
	}

	componentDidMount() {

		const {school_id, start_date, end_date } = this.props

		getEndPointResource("diary", school_id, start_date, end_date)
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

		getEndPointResource("diary", school_id, start_date, end_date)
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
				<BarChart data={this.state.data} barCategoryGap={0}>
					<XAxis dataKey="date" />
					<YAxis />
					<Tooltip />

					<Bar dataKey="diary_usage" fill="#8884d8" />
				</BarChart>

			</ResponsiveContainer>
		</div>
	}
}

export default Diary;