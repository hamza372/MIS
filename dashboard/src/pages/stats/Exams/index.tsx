import * as React from 'react'
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts'

import '../style.css'
import { getEndPointResource } from '../../../utils/getEndPointResource';
import moment from 'moment'

interface P {
	school_id: string
	start_date: number
	end_date: number
}

interface DataRow {
	exams: number
	date: string
	school_id: string
	students_graded: number
}

interface S {
	data: DataRow[]
	loading: boolean
}

class Exams extends React.Component<P, S> {

	constructor(props: P) {
		super(props);

		this.state = {
			loading: false,
			data: []
		}
	}

	componentDidMount() {

		const {school_id, start_date, end_date } = this.props
		
		getEndPointResource("exams",school_id, start_date,end_date)
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

		if(school_id !== this.props.school_id) {
			this.setState({
				data: [],
				loading: true
			})
		}

		getEndPointResource("exams",school_id, start_date,end_date)
			.then(res => res.json())
			.then(parsed => {

				this.setState({
					data: parsed.data,
					loading: false
				})
			})
			.catch(err => {
				console.error(err)
			})
	}

	render() {

		console.log("Exam",this.state.data)

		const data = this.state.data
		.reduce((agg, { exams, date }) => {
			return [
				...agg,
				{
					date: moment(date, "YYYY-MM-DD").unix(),
					exams
				}
			]
		}, [] as any)
		
		return <div className="stat-card">
			{ this.state.loading && <div> Loading....</div> }

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
						/>

					<Bar dataKey="exams" stackId="a" fill="#8884d8"/>
				</BarChart>

			</ResponsiveContainer>
		</div>
	}
}

export default Exams;