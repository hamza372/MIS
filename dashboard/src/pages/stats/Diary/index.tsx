import * as React from 'react'
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts'

import { getEndPointResource } from 'utils/getEndPointResource';
import moment from 'moment';

interface P {
	school_id: string
	start_date: number
	end_date: number
}

interface DataRow {
	diary_usage: number
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

		const data = this.state.data
			.reduce((agg, { diary_usage, date }) => {
				return [
					...agg,
					{
						date: moment(date, "YYYY-MM-DD").unix(),
						diary_usage
					}
				]
			},[] as any)

		return <div className="stat-card">
			<ResponsiveContainer width="90%" height={300}>
				<BarChart data={data} barCategoryGap={0}>
					<XAxis
						dataKey="date"
						tickFormatter={(unixTime) => moment(unixTime * 1000).format('MM/DD/YYYY')}
						domain={['auto', 'auto']}
						minTickGap={0}
						type="number"/>
					<YAxis />
					<Tooltip
						labelFormatter={(a) => moment(parseInt(a as string)*1000).format("MM/DD/YYYY")}
						/>>

					<Bar dataKey="diary_usage" fill="#8884d8" />
				</BarChart>

			</ResponsiveContainer>
		</div>
	}
}

export default Diary;