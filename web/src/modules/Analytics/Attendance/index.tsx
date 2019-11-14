import React, { Component } from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import { connect } from 'react-redux'
import moment from 'moment'
import queryString from 'querystring'
import { PrintHeader } from 'components/Layout'
import Former from "utils/former"
import getSectionsFromClasses from 'utils/getSectionsFromClasses'
import { ProgressBar } from 'components/ProgressBar'

import { ResponsiveContainer, Line, XAxis, YAxis, LineChart, Tooltip } from 'recharts'

import './style.css'

interface Attendance {
	PRESENT: number;
	ABSENT: number;
	LEAVE: number;
	SICK_LEAVE: number;
	SHORT_LEAVE: number;
	CASUAL_LEAVE: number;
}

interface Filter {
	present: boolean;
	absent: boolean;
	leave: boolean;
	percentage: boolean;
}

type StudentAttendance = Attendance & { student: MISStudent }

interface ChartData {
	attendance: {
		[id: string]: Attendance;
	};
	filter: Filter;
	date_format: string;
}

interface TableData {
	attendance: {
		[id: string]: Attendance;
	};
	totals: {
		PRESENT: number;
		LEAVE: number;
		ABSENT: number;
		SICK_LEAVE: number;
		SHORT_LEAVE: number;
		CASUAL_LEAVE: number;
	};
	date_format: string;
}

const AttendanceChart = ({ attendance, filter, date_format }: ChartData) => {
	return <ResponsiveContainer width="100%" height={200}>
		<LineChart
			data={Object.entries(attendance)
				.sort(([d1], [d2,]) => moment(d1, date_format).diff(moment(d2, date_format)))
				.map(([month, { PRESENT, LEAVE, ABSENT, CASUAL_LEAVE, SHORT_LEAVE, SICK_LEAVE }]) => ({
					month, PRESENT, LEAVE: (LEAVE + CASUAL_LEAVE + SHORT_LEAVE + SICK_LEAVE), ABSENT,
					percent: (ABSENT / (ABSENT + PRESENT + LEAVE + CASUAL_LEAVE + SHORT_LEAVE + SICK_LEAVE) * 100).toFixed(2)
				}))}>

			<XAxis dataKey="month" />
			<YAxis />

			<Tooltip />

			{filter.present && <Line dataKey="PRESENT" stroke="#93d0c5" strokeWidth={3} name="Present" />}
			{filter.absent && <Line dataKey="ABSENT" stroke="#ff6b68" strokeWidth={3} name="Absent" />}
			{filter.leave && <Line dataKey="LEAVE" stroke="#807f7f" strokeWidth={3} name="Leave" />}
			{filter.percentage && <Line dataKey="percent" stroke="#74aced" strokeWidth={3} name="Percentage" />}
		</LineChart>
	</ResponsiveContainer>
}

const AttendanceTable = ({ attendance, totals, date_format }: TableData) => {
	return <div className="section table line" style={{ margin: "20px 0", backgroundColor: "#c2bbbb21" }}>
		<div className="table row heading">
			<label style={{ backgroundColor: "#efecec" }}><b>Date</b></label>
			<label style={{ backgroundColor: "#93d0c5" }}><b>Present</b></label>
			<label style={{ backgroundColor: "#fc6171" }}><b>Absent</b></label>
			<label style={{ backgroundColor: "#e0e0e0" }}><b>Leave</b></label>
			<label style={{ backgroundColor: "#bedcff" }}><b>Absentee(%)</b></label>
		</div>
		{
			[...Object.entries(attendance)
				.sort(([d1], [d2,]) => moment(d1, date_format).diff(moment(d2, date_format)))
				.map(([month, { PRESENT, LEAVE, ABSENT, CASUAL_LEAVE, SHORT_LEAVE, SICK_LEAVE }]) =>

					<div className="table row" key={month}>
						<div style={{ backgroundColor: "#efecec" }}>{month}</div>
						<div style={{ backgroundColor: "#93d0c5" }}>{PRESENT}</div>
						<div style={{ backgroundColor: "#fc6171" }}>{ABSENT}</div>
						<div style={{ backgroundColor: "#e0e0e0" }}>{LEAVE + CASUAL_LEAVE + SHORT_LEAVE + SICK_LEAVE}</div>
						<div style={{ backgroundColor: "#bedcff" }}>{(ABSENT / (ABSENT + PRESENT + LEAVE + CASUAL_LEAVE + SHORT_LEAVE + SICK_LEAVE) * 100).toFixed(2)}%</div>
					</div>
				),
			<div className="table row footing" style={{ borderTop: '1.5px solid #333' }} key={Math.random()}>
				<label style={{ backgroundColor: "#efecec" }}><b>Total</b></label>
				<label style={{ backgroundColor: "#93d0c5" }}><b>{totals.PRESENT}</b></label>
				<label style={{ backgroundColor: "#fc6171" }}><b>{totals.ABSENT}</b></label>
				<label style={{ backgroundColor: "#e0e0e0" }}><b>{totals.LEAVE + totals.CASUAL_LEAVE + totals.SHORT_LEAVE + totals.SICK_LEAVE}</b></label>
				<label style={{ backgroundColor: "#bedcff" }}><b>{(totals.ABSENT / (totals.ABSENT + totals.PRESENT + totals.LEAVE + totals.CASUAL_LEAVE + totals.SHORT_LEAVE + totals.SICK_LEAVE) * 100).toFixed(2)}%</b></label>
			</div>
			]
		}
	</div>
}

interface P {
	students: RootDBState["students"];
	classes: RootDBState["classes"];
	settings: RootDBState["settings"];
	schoolLogo: RootDBState["assets"]["schoolLogo"];
}

interface S {
	filterText: string;
	chartFilter: {
		present: boolean;
		absent: boolean;
		leave: boolean;
		percentage: boolean;
	};
	classFilter: string;
	selected_section_id: string;
	selected_period: string;
	start_date: number;
	end_date: number;
	isStudentAttendanceFilter: boolean;
	percentage: number
	loading: boolean;
	totals: {
		PRESENT: number;
		LEAVE: number;
		ABSENT: number;
		SICK_LEAVE: number;
		SHORT_LEAVE: number;
		CASUAL_LEAVE: number;
	};
	attendance: {
		[id: string]: Attendance;
	};
	student_attendance: {
		[id: string]: StudentAttendance;
	};
}

type propTypes = RouteComponentProps & P

class AttendanceAnalytics extends Component<propTypes, S> {

	background_calculation: NodeJS.Timeout
	former: Former
	constructor(props: propTypes) {
		super(props)

		const parsed_query = queryString.parse(this.props.location.search);

		const sd_param = parsed_query["?start_date"] || ""
		const ed_param = parsed_query["end_date"] || ""
		const period = parsed_query["period"] || ""

		const start_date = sd_param !== "" ? moment(sd_param, "MM-DD-YYYY").unix() * 1000 : moment().subtract(1, 'year').unix() * 1000
		const end_date = ed_param !== "" ? moment(ed_param, "MM-DD-YYYY").unix() * 1000 : moment().unix() * 1000

		this.state = {
			filterText: "",
			chartFilter: {
				present: true,
				absent: true,
				leave: true,
				percentage: true
			},
			percentage: 0,
			classFilter: "",
			selected_section_id: "",
			selected_period: period !== "" ? period.toString() : "Monthly",
			start_date: start_date,
			end_date: end_date,
			isStudentAttendanceFilter: false,

			loading: true,
			totals: {
				PRESENT: 0,
				LEAVE: 0,
				ABSENT: 0,
				SICK_LEAVE: 0,
				SHORT_LEAVE: 0,
				CASUAL_LEAVE: 0
			},
			attendance: {},
			student_attendance: {}

		}

		this.former = new Former(this, [])
	}

	componentDidMount() {
		this.calculate()
	}

	onStateChange = () => {

		const start_date = moment(this.state.start_date).format("MM-DD-YYYY")
		const end_date = moment(this.state.end_date).format("MM-DD-YYYY")
		const period = this.state.selected_period

		const url = '/analytics/attendance'
		const params = `start_date=${start_date}&end_date=${end_date}&period=${period}`

		window.history.replaceState(this.state, "Attendance Analytics", `${url}?${params}`)
		this.calculate()
	}

	componentWillReceiveProps(nextProps: propTypes) {

		const parsed_query = queryString.parse(nextProps.location.search);

		const sd_param = parsed_query["?start_date"] || ""
		const ed_param = parsed_query["end_date"] || ""
		const period = parsed_query["period"] || ""

		// set defaults if params are not passed
		const start_date = sd_param !== "" ? moment(sd_param, "MM-DD-YYYY").unix() * 1000 : moment().subtract(1, 'year').unix() * 1000
		const end_date = ed_param !== "" ? moment(ed_param, "MM-DD-YYYY").unix() * 1000 : moment().unix() * 1000
		const selected_period = period !== "" ? period.toString() : ""

		this.setState({
			start_date,
			end_date,
			selected_period
		})

		this.calculate()

	}

	calculate = () => {

		const { students } = this.props
		const students_list = Object.values(students)

		let i = 0;

		clearTimeout(this.background_calculation)

		const selected_section = this.state.selected_section_id;
		const temp_sd = moment(this.state.start_date).format("YYYY-MM-DD")
		const temp_ed = moment(this.state.end_date).format("YYYY-MM-DD")
		const period_format = this.state.selected_period === 'Monthly' ? 'MM/YYYY' : 'DD/MM/YYYY'

		const totals = { PRESENT: 0, LEAVE: 0, ABSENT: 0, SICK_LEAVE: 0, SHORT_LEAVE: 0, CASUAL_LEAVE: 0 };
		const attendance: { [id: string]: Attendance } = {} // [mm/yyyy] || [dd/mm/yyyy]: { present / absent / leave }
		const student_attendance: { [id: string]: StudentAttendance } = {} // [id]: { absents, presents, leaves }

		const reducify = () => {

			const interval = Math.floor(students_list.length/10)
			if (i % interval === 0) {
				this.setState({
					percentage: (i / students_list.length) * 100
				})
			}

			if (i >= students_list.length) {
				// done
				this.setState({
					loading: false,
					totals,
					attendance,
					student_attendance,
					percentage: 0
				})

				return
			}

			const student = students_list[i]
			const sid = student.id;
			i += 1

			if (selected_section !== "" && student.section_id !== selected_section) {
				this.background_calculation = setTimeout(reducify, 0)
				return
			}

			if (student.Name === undefined || student.attendance === undefined) {
				this.background_calculation = setTimeout(reducify, 0)
				return
			}

			const attendance_status_count = { PRESENT: 0, LEAVE: 0, ABSENT: 0, SICK_LEAVE: 0, SHORT_LEAVE: 0, CASUAL_LEAVE: 0 }

			for (const [date, record] of Object.entries(student.attendance)) {

				if (!(moment(date).isSameOrAfter(temp_sd,"day") && moment(date).isSameOrBefore(temp_ed,"day"))) {
					continue
				}

				totals[record.status] += 1;
				attendance_status_count[record.status] += 1;

				const period_key = moment(date).format(period_format);
				const m_status = attendance[period_key] || { PRESENT: 0, LEAVE: 0, ABSENT: 0, SHORT_LEAVE: 0, CASUAL_LEAVE: 0, SICK_LEAVE: 0 }
				m_status[record.status] += 1;
				attendance[period_key] = m_status;
			}

			student_attendance[sid] = { student, ...attendance_status_count }

			this.background_calculation = setTimeout(reducify, 0)

		}

		this.background_calculation = setTimeout(reducify, 0)

	}

	render() {
		const { classes, settings, schoolLogo } = this.props
		const { student_attendance, totals, attendance } = this.state;

		const sortedSections = getSectionsFromClasses(classes).sort((a, b) => (a.classYear || 0) - (b.classYear || 0));

		const period_format = this.state.selected_period === 'Monthly' ? 'MM/YYYY' : 'DD/MM/YYYY'

		const items = Object.entries(student_attendance)
			.filter(([sid, { student }]) =>
				((student.tags === undefined || !student.tags["PROSPECTIVE"]) &&
					(this.state.classFilter === "" || student.section_id === this.state.classFilter)) &&
				(student.Name.toUpperCase().includes(this.state.filterText.toUpperCase()))
			)
			.sort(([, { ABSENT: a1 }], [, { ABSENT: a2 }]) => a2 - a1)


		return this.state.loading ? <ProgressBar percentage={this.state.percentage}/> :<div className = "attendance-analytics">
				
			<PrintHeader
				settings={settings}
				logo={schoolLogo}
			/>

		<div className="table row">
			<label>Total Present</label>
			<div>{totals.PRESENT}</div>
		</div>
			<div className="table row">
				<label>Total Absent</label>
				<div>{totals.ABSENT}</div>
			</div>
			<div className="table row">
				<label>Total Leave</label>
				<div>{totals.LEAVE + totals.CASUAL_LEAVE + totals.SHORT_LEAVE + totals.SICK_LEAVE}</div>
			</div>
			<div className="table row">
				<label>Absentee (%)</label>
				<div>{(totals.ABSENT / (totals.ABSENT + totals.PRESENT + totals.LEAVE + totals.CASUAL_LEAVE + totals.SHORT_LEAVE + totals.SICK_LEAVE) * 100).toFixed(2)}%</div>
			</div>

			<div className="no-print btn-filter-toggle row">
				<div className="button green" onClick={() => this.setState({ isStudentAttendanceFilter: !this.state.isStudentAttendanceFilter })}>Show Filters
			</div>
			</div>
			{
			this.state.isStudentAttendanceFilter && <div className="no-print section form">
				<div className="row">
					<label> Start Date </label>
					<input type="date"
						onChange={this.former.handle(["start_date"], () => true, this.onStateChange)}
						value={moment(this.state.start_date).format("YYYY-MM-DD")}
						max={moment().format("YYYY-MM-DD")} />
				</div>
				<div className="row">
					<label> End Date </label>
					<input type="date"
						onChange={this.former.handle(["end_date"], () => true, this.onStateChange)}
						value={moment(this.state.end_date).format("YYYY-MM-DD")}
						max={moment().format("YYYY-MM-DD")} />
				</div>

				<div className="row">
					<label> Class </label>
					<select {...this.former.super_handle(["selected_section_id"], () => true, this.onStateChange)}>
						<option value="">All Classes </option>
						{
							sortedSections.map(s => <option key={s.id} value={s.id}>{s.namespaced_name}</option>)
						}
					</select>
				</div>

				<div className="row">
					<label> Attendance Period </label>
					<select {...this.former.super_handle(["selected_period"], () => true, this.onStateChange)}>
						<option value="Daily">Daily</option>
						<option value="Monthly" selected>Monthly</option>
					</select>
				</div>
			</div>}


		<div className="divider">{this.state.selected_period} Attendance</div>

			<div className="no-print">
				<AttendanceChart
					attendance={attendance}
					filter={this.state.chartFilter}
					date_format={period_format}
				/>
			</div>

			<div className="no-print checkbox-container">
				<div className="chart-checkbox" style={{ color: "#93d0c5" }}>
					<input
						type="checkbox"
						{...this.former.super_handle(["chartFilter", "present"])}
					/>
					Present
			</div>

				<div className="chart-checkbox" style={{ color: "#fc6171" }}>
					<input
						type="checkbox"
						{...this.former.super_handle(["chartFilter", "absent"])}
					/>
					Absent
			</div>

				<div className="chart-checkbox" style={{ color: "#656565" }}>
					<input
						type="checkbox"
						{...this.former.super_handle(["chartFilter", "leave"])}
					/>
					Leave
			</div>

				<div className="chart-checkbox" style={{ color: "#74aced" }}>
					<input
						type="checkbox"
						{...this.former.super_handle(["chartFilter", "percentage"])}
					/>
					Absentee (%)
			</div>
			</div>

			<AttendanceTable
				attendance={attendance}
				totals={totals}
				date_format={period_format}
			/>

			<div className="divider">Student Attendance</div>
			<div className="section">
				<div className="row no-print">
					<input
						className="search-bar"
						type="text"
						{...this.former.super_handle(["filterText"])}
						placeholder="search"
					/>
					<select {...this.former.super_handle(["classFilter"])}>
						<option value="">Select Class</option>
						{
							sortedSections.map(s => <option key={s.id} value={s.id}>{s.namespaced_name}</option>)
						}
					</select>
				</div>

				<div className="table row">
					<label><b>Name</b></label>
					<label><b>Phone</b></label>
					<label><b>Days Absent</b></label>
				</div>
				{
					items
						.map(([sid, { student, PRESENT, ABSENT, LEAVE }]) => <div className="table row" key={sid}>
							<Link to={`/student/${sid}/attendance`}>{student.Name}</Link>
							<div>{student.Phone}</div>
							<div style={ABSENT === 0 ? { color: "#5ecdb9" } : { color: "#fc6171" }}>{ABSENT}</div>
						</div>)
				}
				<div className="print button" onClick={() => window.print()} style={{ marginTop: "10px" }}>Print</div>

			</div>
		</div>
	}
}
export default connect((state: RootReducerState) => ({
	students: state.db.students,
	classes: state.db.classes,
	settings: state.db.settings,
	schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : ""
}))(AttendanceAnalytics)
