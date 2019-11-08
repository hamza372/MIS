import * as React from 'react'
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts'

import { getEndPointResource } from 'utils/getEndPointResource';
import moment from 'moment'

interface P {
	school_id: string
	start_date: number
	end_date: number
}

interface DataRow {
	sms_usage: number
	date: number
}

interface S {
	data: DataRow[],
	loading: boolean
}

class SMS extends React.Component<P, S> {

	constructor(props: P) {
		super(props);

		this.state = {
			data: [],
			loading: false
		}
	}

	componentDidMount() {

		const {school_id, start_date, end_date } = this.props
		
		getEndPointResource("sms", school_id, start_date, end_date)
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
		
		getEndPointResource("sms", school_id, start_date, end_date)
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
			.reduce((agg, { sms_usage, date }) => {
				return [
					...agg,
					{
						date: moment(date, "YYYY-MM-DD").unix(),
						sms_usage
					}
				]
			},[] as any)

		console.log(data)
		return <div className="stat-card">
			{ this.state.loading && <div> Loading....</div> }
			<ResponsiveContainer width="90%" height={300}>
				<BarChart data={data} barCategoryGap={0} barGap={0}>
					<XAxis
						dataKey="date"
						tickFormatter={(unixTime) => moment(unixTime * 1000).format('MM/DD/YYYY')}
						domain={['auto', 'auto']}
						minTickGap={0}
						type="number"/>
					<YAxis />
					<Tooltip
						labelFormatter={(a) => moment(parseInt(a as string)*1000).format("MM/DD/YYYY")}
						/>

					<Bar dataKey="sms_usage" stackId="a" fill="#ffc658"/>
				</BarChart>

			</ResponsiveContainer>
		</div>
	}
}

export default SMS;