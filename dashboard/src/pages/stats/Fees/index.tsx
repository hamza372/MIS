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
    unique_students: number
    total: number
    school_id: string
    num_payments: number
	date: string
}

interface S {
	data: DataRow[]
	loading: boolean
}

class Fees extends React.Component<P, S> {

	constructor(props: P) {
		super(props);

		this.state = {
			data: [],
			loading: false
		}
	}

	componentDidMount() {

		const { school_id, start_date, end_date } = this.props
		
		getEndPointResource("fees", school_id, start_date,end_date)
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

		getEndPointResource("fees",school_id, start_date,end_date)
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
				<BarChart data={this.state.data} barCategoryGap={0} barGap={0}>
					<XAxis dataKey="date" />
					<YAxis />
					<Tooltip />

					<Bar dataKey="num_payments" stackId="a" fill="#8884d8"/>
				</BarChart>

			</ResponsiveContainer>
		</div>
	}
}

export default Fees;