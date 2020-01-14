import * as React from 'react'
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts'
import moment from 'moment'
import { connect } from 'react-redux';
import { getEndPointResource } from 'actions';

interface P {
	school_id: string
	start_date: number
	end_date: number
	sms: RootReducerState["stats"]["sms"]
	getEndPointResource: ( point: string, school_id: string, start_date: number, end_date: number ) => any
}

interface S {}

class SMS extends React.Component<P, S> {

	constructor(props: P) {
		super(props);

		this.state = {}
	}

	componentDidMount() {

		const {school_id, start_date, end_date } = this.props
		this.props.getEndPointResource("SMS_DATA", school_id, start_date, end_date)
	}

	componentWillReceiveProps (newProps: P) {

		const { school_id, start_date, end_date } = newProps
		
		if (this.props.school_id !== school_id ||
			this.props.start_date !== start_date ||
			this.props.end_date !== end_date
		) {
			this.props.getEndPointResource("SMS_DATA", school_id, start_date, end_date)
		}
	}

	render() {

		const data = this.props.sms && this.props.sms.data
			.reduce((agg, { sms_usage, date }) => {
				return [
					...agg,
					{
						date: moment(date, "YYYY-MM-DD").unix(),
						sms_usage
					}
				]
			},[] as any)

		return <div className="stat-card">
			{ this.props.sms === undefined && <div> Loading....</div> }
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

export default connect((state: RootReducerState) => ({
	sms: state.stats.sms
}), (dispatch: Function) => ({
	getEndPointResource: (point: string, school_id: string, start_date: number, end_date: number) => dispatch(getEndPointResource(point, school_id, start_date, end_date))
}))(SMS);