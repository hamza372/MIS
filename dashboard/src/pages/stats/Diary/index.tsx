import * as React from 'react'
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts'
import { getEndPointResource } from 'actions/index'
import moment from 'moment';
import { connect } from 'react-redux';

interface P {
	school_id: string
	start_date: number
	end_date: number
	diary: RootReducerState["stats"]["diary"]
	getEndPointResource: ( point: string, school_id: string, start_date: number, end_date: number ) => any
}

interface S {}

class Diary extends React.Component<P, S> {

	constructor(props: P) {
		super(props);

		this.state = {}
	}

	componentDidMount() {

		const {school_id, start_date, end_date } = this.props
		this.props.getEndPointResource("DIARY_DATA", school_id, start_date, end_date)
	}

	componentWillReceiveProps (newProps: P) {

		const { school_id, start_date, end_date } = newProps

		if (this.props.school_id !== school_id ||
			this.props.start_date !== start_date ||
			this.props.end_date !== end_date
		) {
			this.props.getEndPointResource("DIARY_DATA", school_id, start_date, end_date)
		}
	}

	render() {

		const data = this.props.diary && this.props.diary.data
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

export default connect(( state: RootReducerState) => ({
	diary: state.stats.diary
}), (dispatch: Function) => ({
	getEndPointResource: (point: string, school_id: string, start_date: number, end_date: number) => dispatch(getEndPointResource(point, school_id, start_date, end_date))
}))(Diary);