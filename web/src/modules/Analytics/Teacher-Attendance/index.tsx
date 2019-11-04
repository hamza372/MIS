import React, { Component } from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import queryString from 'querystring'
import { connect } from 'react-redux'
import moment from 'moment'
import { PrintHeader } from 'components/Layout'
import Former from "utils/former"

import { ResponsiveContainer, Line, XAxis, YAxis, LineChart, Tooltip } from 'recharts'

interface Attendance {
	PRESENT: number;
	ABSENT: number;
	LEAVE: number;
}

type TAttendance = Attendance & { teacher: MISTeacher}

interface Filter {
		present: boolean;
		absent: boolean;
		leave: boolean;
		percentage: boolean;
}

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
	};
	date_format: string;
}

const AttendanceChart = ({attendance, filter, date_format}: ChartData) => {		
		return <ResponsiveContainer width="100%" height={200}>
					<LineChart data={Object.entries(attendance)
						.sort(([d1, ], [d2, ]) => moment(d1, date_format).diff(moment(d2, date_format)))
						.map(([month, { PRESENT, LEAVE, ABSENT }]) => ({
							month, PRESENT, LEAVE, ABSENT, 
							percent: ( ABSENT / (ABSENT + PRESENT + LEAVE) * 100).toFixed(2)
						}))}>

						<XAxis dataKey="month"/>
						<YAxis />

						<Tooltip />

						{ filter.present && <Line dataKey="PRESENT" stroke="#93d0c5" strokeWidth={3} name="Present"/> }
						{ filter.absent && <Line dataKey="ABSENT" stroke="#ff6b68" strokeWidth={3} name="Absent" />}
						{ filter.leave && <Line dataKey="LEAVE" stroke="#807f7f" strokeWidth={3} name="Leave" />}
						{ filter.percentage && <Line dataKey="percent" stroke="#74aced" strokeWidth={3} name="Percentage" />}
					</LineChart>
			</ResponsiveContainer>
}

const AttendanceTable = ({attendance, totals, date_format}: TableData) =>{
	return <div className="section table line" style={{margin: "20px 0", backgroundColor:"#c2bbbb21" }}>
				<div className="table row heading">
					<label style={{ backgroundColor: "#efecec"}}><b>Date</b></label>
					<label style={{ backgroundColor: "#93d0c5"}}><b>Present</b></label>
					<label style={{ backgroundColor: "#fc6171"}}><b>Absent</b></label>
					<label style={{ backgroundColor: "#e0e0e0"}}><b>Leave</b></label>
					<label style={{ backgroundColor: "#bedcff"}}><b>Absentee(%)</b></label>
				</div>
				{
					[...Object.entries(attendance)
						.sort(([d1, ], [d2, ]) => moment(d1, date_format).diff(moment(d2, date_format)))
						.map(([month, {PRESENT, LEAVE, ABSENT} ]) =>
						
							<div className="table row" key={Math.random()}>
								<div style={{ backgroundColor: "#efecec"}}>{month }</div>
								<div style={{ backgroundColor: "#93d0c5"}}>{PRESENT}</div>
								<div style={{ backgroundColor: "#fc6171"}}>{ABSENT}</div>
								<div style={{ backgroundColor: "#e0e0e0"}}>{LEAVE}</div>
								<div style={{ backgroundColor: "#bedcff"}}>{(ABSENT / (ABSENT + PRESENT + LEAVE) * 100) ? (ABSENT / (ABSENT + PRESENT + LEAVE) * 100).toFixed(2) : "0"}%</div>
							</div>
						),
						<div className="table row footing" style={{borderTop: '1.5px solid #333'}} key={Math.random()}>   
							<label style={{ backgroundColor: "#efecec"}}><b>Total</b></label>
							<label style={{ backgroundColor: "#93d0c5"}}><b>{totals.PRESENT}</b></label>
							<label style={{ backgroundColor: "#fc6171"}}><b>{totals.ABSENT}</b></label>
							<label style={{ backgroundColor: "#e0e0e0"}}><b>{totals.LEAVE}</b></label>
							<label style={{ backgroundColor: "#bedcff"}}><b>{(totals.ABSENT / (totals.ABSENT + totals.PRESENT + totals.LEAVE) * 100).toFixed(2)}%</b></label>
						</div>
					]
				}
			</div> 
}

interface P {
	teachers: RootDBState["faculty"];
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
	is_attendance_filter: boolean;
	selected_faculty_id: string;
	selected_period: string;
	start_date: number;
	end_date: number;
}

type propTypes = RouteComponentProps & P
	
	
class TeacherAttendanceAnalytics extends Component < propTypes, S > {

	former: Former
	constructor(props: propTypes) {
	super(props)
	
	  	const parsed_query = queryString.parse(this.props.location.search);

		const sd_param = parsed_query["?start_date"] || ""
		const ed_param = parsed_query["end_date"] || ""
		const period = parsed_query["period"] || ""

		const start_date =  sd_param !== "" ? moment(sd_param, "MM-DD-YYYY").unix() * 1000 : moment().subtract(1,'year').unix() * 1000
		const end_date = ed_param !=="" ? moment(ed_param, "MM-DD-YYYY").unix() * 1000 : moment().unix() * 1000

		this.state = {
			filterText: "",
			chartFilter: {
				present: true,
				absent: true,
				leave: true,
				percentage: true
			},
			classFilter: "",
			is_attendance_filter: false,
			selected_faculty_id: "",
			selected_period: period !== "" ? period.toString() : "Monthly",
			start_date: start_date,
			end_date: end_date,
		}
		this.former = new Former(this, [])
	}

	getKey = (record: { [status in MISTeacherAttendanceStatus ]: number}) => {
		
		if (record["check_in"]) {
			return "PRESENT"
		}
		else if (record["absent"]) {
			return "ABSENT"
		}
		else if (record["leave"]) {
			return "LEAVE"
		}
	} 

	onStateChange = () => {

		const start_date = moment(this.state.start_date).format("MM-DD-YYYY")
		const end_date = moment(this.state.end_date).format("MM-DD-YYYY")
		const period = this.state.selected_period

		const url = '/analytics/teacher-attendance'
		const params = `start_date=${start_date}&end_date=${end_date}&period=${period}`

		window.history.replaceState(this.state, "Fee Analytics", `${url}?${params}`)
	}

	componentWillReceiveProps(nextProps: propTypes) { 

		const parsed_query = queryString.parse(nextProps.location.search);

		const sd_param = parsed_query["?start_date"] || ""
		const ed_param = parsed_query["end_date"] || ""
		const period = parsed_query["period"] || ""

		// set defaults if params are not passed
		const start_date =  sd_param !== "" ? moment(sd_param, "MM-DD-YYYY").unix() * 1000 : moment().subtract(1,'year').unix() * 1000
		const end_date = ed_param !=="" ? moment(ed_param, "MM-DD-YYYY").unix() * 1000 : moment().unix() * 1000
		const selected_period = period !=="" ? period.toString() : ""
		
		this.setState({
			start_date,
			end_date,
			selected_period
		})
	
	}
	
	render()
	{
		const { teachers, settings, schoolLogo } = this.props

		const totals = { PRESENT: 0, LEAVE: 0, ABSENT: 0 };
		const attendance: {[id: string]: Attendance } = { }
		const teacher_attendance: {[id: string]: TAttendance } = { }

		const temp_sd = moment(this.state.start_date).format("YYYY-MM-DD")
		const temp_ed = moment(this.state.end_date).format("YYYY-MM-DD")
		const period_format = this.state.selected_period === 'Monthly' ? 'MM/YYYY' : 'DD/MM/YYYY'

		for(const [tid, teacher] of Object.entries(teachers)) {
	
			if( this.state.selected_faculty_id !=="" && tid !== this.state.selected_faculty_id)
				continue

			if(teacher.Name === undefined || teacher.attendance === undefined) {
				continue;
			}

			const t_record = { PRESENT: 0, LEAVE: 0, ABSENT: 0 }

			for(const [date, record] of Object.entries(teacher.attendance)) {

				if(!( moment(date).isSameOrAfter(temp_sd) && moment(date).isSameOrBefore(temp_ed) )){
					continue
				}

				const key = this.getKey(record)

				totals[key] += 1;
				t_record[key] += 1;

				const period_key = moment(date).format(period_format);

				const m_status = attendance[period_key] || { PRESENT: 0, LEAVE: 0, ABSENT: 0}
				m_status[key] += 1;
				attendance[period_key] = m_status;
			}
			teacher_attendance[tid] = { teacher ,...t_record }
		}

		const items = Object.entries(teacher_attendance)
			.sort(([, { ABSENT: a1 }], [, {ABSENT: a2}]) => a2 - a1)

		return <div className="attendance-analytics">

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
			<div>{totals.LEAVE}</div>
		</div>
		<div className="table row">
			<label>Absentee Percent</label>
			<div>{ (totals.ABSENT / (totals.ABSENT + totals.PRESENT + totals.LEAVE) * 100).toFixed(2)}%</div>
		</div>

		<div className="no-print btn-filter-toggle row">
			<div className="button green" onClick={ () => this.setState({is_attendance_filter: !this.state.is_attendance_filter})}>Show Filters
			</div>
		</div>
		{ this.state.is_attendance_filter && <div className="no-print section form">				
				<div className="row">
					<label> Start Date </label>
					<input type="date" 
						   onChange={this.former.handle(["start_date"], () => true, this.onStateChange)} 
						   value={moment(this.state.start_date).format("YYYY-MM-DD")} 
						   max = {moment().format("YYYY-MM-DD")}/>
				</div>
				<div className="row">	
					<label> End Date </label>
					<input type="date" 
						   onChange={this.former.handle(["end_date"], () => true, this.onStateChange)} 
						   value={moment(this.state.end_date).format("YYYY-MM-DD")} 
						   max = {moment().format("YYYY-MM-DD")}/>
				</div>

				<div className="row">	
					<label> Teacher </label>
					<select {...this.former.super_handle(["selected_faculty_id"], () => true, this.onStateChange)}>
							<option value="">All Teacher </option> 
							{
								Object.values(this.props.teachers)
									.filter(f => f && f.Active && f.Name)
									.sort((a, b) => a.Name.localeCompare(b.Name))
									.map(f => <option value={f.id}>{f.Name}</option>)
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
				attendance = { attendance }
				filter = { this.state.chartFilter }
				date_format = { period_format }
			/>
		</div>

		<div className="no-print checkbox-container">
			<div className="chart-checkbox" style={{ color:"#93d0c5" }}>
				<input
					type="checkbox"
					{...this.former.super_handle(["chartFilter", "present"])}
				/>
				Present
			</div>

			<div className="chart-checkbox" style={{ color:"#fc6171" }}>
				<input
					type="checkbox"
					{...this.former.super_handle(["chartFilter", "absent"])}
				/>
				Absent
			</div>

			<div className="chart-checkbox" style={{ color:"#656565" }}>
				<input
					type="checkbox"
					{...this.former.super_handle(["chartFilter", "leave"])}
				/>
				Leave
			</div>
			
			<div className="chart-checkbox" style={{ color:"#74aced" }}>
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
			date_format = { period_format }
		/>

		<div className="divider">Teacher Attendance</div>
		<div className="section">
			<div className="row no-print">
				<input 
					className="search-bar"
					type="text"
					{...this.former.super_handle(["filterText"])}
					placeholder="search"
				/>
			</div>

			<div className="table row">
				<label><b>Name</b></label>
				<label><b>Days Absent</b></label>
			</div>
			{
				items
					.filter(([,{ ABSENT }]) => ABSENT !== 0)		
					.map(([tid, { teacher, PRESENT, ABSENT, LEAVE }]) => {
						return <div key={tid} className="table row">
							<Link to={`/faculty/${tid}/attendance`}>{teacher.Name}</Link>
							<div style={ABSENT === 0 ? { color: "#5ecdb9" } : { color: "#fc6171" }}>{ABSENT}</div>
						</div>
					})
			}
			<div className="print button" onClick={() => window.print()} style={{ marginTop: "10px" }}>Print</div>

		</div>
	</div>
	}
}
export default connect((state: RootReducerState ) =>({
	teachers: state.db.faculty,
	settings: state.db.settings,
	schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : ""
}))(TeacherAttendanceAnalytics)
