import * as React from 'react'
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line } from 'recharts'
import { array } from 'prop-types';

interface P {

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
	//totalstudents: DataRows[]
	//usage_stats = data.map(x => x/total_students)
}

class StudentAttendance extends React.Component<P, S> {

	constructor(props: P) {
		super(props);

		this.state = {
			data: []
			//totalstudents: []
		}
	}

	componentDidMount() {
		fetch('http://localhost:8080/dashboard/student_attendance?school_id=brighterschool&start_date=2018-10-15&end_date=2018-12-19')
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
			Student Attendance Module Usage

			<ResponsiveContainer width="100%" height={500}>
				<LineChart data={this.state.data}>
					<XAxis dataKey="date" />
					<YAxis />
					<Tooltip />

					<Line dataKey="students_marked" />
					<Line dataKey="total_students"/>
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