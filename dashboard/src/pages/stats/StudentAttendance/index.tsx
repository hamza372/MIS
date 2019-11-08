import * as React from 'react'
import { ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts'
import { getEndPointResource } from 'utils/getEndPointResource';

import moment from 'moment'

interface P {
	school_id: string
	start_date: number
	end_date: number
}

interface DataRow {
	students_marked: number
	school_id: string
	date: string
}
/*interface DataRows {
//	total_students: number
}*/

interface S {
	data: DataRow[]
	loading: boolean
	//totalstudents: DataRows[]
	//usage_stats = data.map(x => x/total_students)
}

class StudentAttendance extends React.Component<P, S> {

	constructor(props: P) {
		super(props);

		this.state = {
			data: [],
			loading: false
			//totalstudents: []
		}
	}


	componentDidMount() {

		const {school_id, start_date, end_date } = this.props

		getEndPointResource("student_attendance",school_id,start_date,end_date)
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

		getEndPointResource("student_attendance",school_id,start_date,end_date)
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


		const data = this.state.data
			.reduce((agg, { students_marked, date }) => {
				return [
					...agg,
					{
						date: moment(date, "YYYY-MM-DD").unix(),
						students_marked
					}
				]
			},[] as any)

		return <div className="stat-card">
			{ this.state.loading && <div> Loading....</div> }
			<ResponsiveContainer width="90%" height={300}>
				<BarChart
					data={data}
					barCategoryGap={0}
				>
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
					<Bar dataKey="students_marked" stackId="a" fill="#8884d8"/>
				</BarChart>

			</ResponsiveContainer>
		</div>
	}
}

export default StudentAttendance;

/*
Getting Percentage of Total Students Marked per Day:
	1. data.map(x => x/total_students)
	2. Use this as the data displayed on dashboard

Assigning Usage Score:	
	1. Pass all data into four separate arrays, entitled: High[], Med[], OK[], and Low[]
	2. Find length of each array
	3. Assign usage score based on longest array
	4. Display the associated icon (e.g. 'Low' usage score -> "Low Usage" box)
*/