import * as React from 'react'
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line } from 'recharts'
import { getEndPointResource } from '../../../utils/getEndPointResource';

import '../style.css'

interface P {
	school_id: string
	start_date: string
	end_date: string
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

		return <div className="stat-card">
			{ this.state.loading && <div> Loading....</div> }
			<ResponsiveContainer width="90%" height={300}>
				<LineChart data={this.state.data}>
					<XAxis dataKey="date" />
					<YAxis />
					<Tooltip />

					<Line dataKey="students_marked" stroke="#93d0c5" strokeWidth={3}/>
					<Line dataKey="total_students"  color="#222"/>
				</LineChart>

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