import React, { Component } from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import { connect } from 'react-redux'
import moment from 'moment'
import { PrintHeader } from '../../../components/Layout'
import Former from "../../../utils/former"

import { ResponsiveContainer, Line, XAxis, YAxis, LineChart, Tooltip } from 'recharts'

interface Attendance {
	PRESENT: number
	ABSENT: number
	LEAVE: number
}

type TAttendance = Attendance & { teacher: MISTeacher}

interface Filter {
		present: boolean
		absent: boolean
		leave: boolean
		percentage: boolean
}

interface ChartData {
	monthly_attendance: {
		[id: string]: Attendance
	}
	filter: Filter
}

interface TableData {
	monthly_attendance: {
		[id: string]: Attendance
	}
	totals: {
		PRESENT: number;
		LEAVE: number;
		ABSENT: number;
	}
}

const MonthlyAttendanceChart = ({monthly_attendance, filter}: ChartData) => {		
		return <ResponsiveContainer width="100%" height={200}>
					<LineChart 
				data={Object.entries(monthly_attendance)
					.sort(([month,], [m2,]) => month.localeCompare(m2))
					.map(([month, { PRESENT, LEAVE, ABSENT }]) => {
							
						const percent = (1 - ABSENT / (PRESENT + LEAVE)) * 100
							return { month, PRESENT, LEAVE, ABSENT, percent: isFinite(percent) ? percent : 1 }
						})}>

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

const MonthlyAttendanceTable = ({monthly_attendance, totals}: TableData) =>{
	return <div className="section table line" style={{margin: "20px 0", backgroundColor:"#c2bbbb21" }}>
				<div className="table row heading">
					<label style={{ backgroundColor: "#efecec"}}><b>Date</b></label>
					<label style={{ backgroundColor: "#93d0c5"}}><b>Present</b></label>
					<label style={{ backgroundColor: "#fc6171"}}><b>Absent</b></label>
					<label style={{ backgroundColor: "#e0e0e0"}}><b>Leave</b></label>
					<label style={{ backgroundColor: "#bedcff"}}><b>Absentee(%)</b></label>
				</div>
				{
					[...Object.entries(monthly_attendance)
						.sort(([month, ], [m2, ]) => month.localeCompare(m2))
						.map(([month, {PRESENT, LEAVE, ABSENT} ]) =>
						
							<div className="table row" key={Math.random()}>
								<div style={{ backgroundColor: "#efecec"}}>{month }</div>
								<div style={{ backgroundColor: "#93d0c5"}}>{PRESENT}</div>
								<div style={{ backgroundColor: "#fc6171"}}>{ABSENT}</div>
								<div style={{ backgroundColor: "#e0e0e0"}}>{LEAVE}</div>
								<div style={{ backgroundColor: "#bedcff"}}>{ isFinite( Math.round((ABSENT / (PRESENT + LEAVE )) * 100)) ? Math.round((ABSENT / (PRESENT + LEAVE )) * 100) : "0"}%</div>
							</div>
						),
						<div className="table row footing" style={{borderTop: '1.5px solid #333'}} key={Math.random()}>   
							<label style={{ backgroundColor: "#efecec"}}><b>Total</b></label>
							<label style={{ backgroundColor: "#93d0c5"}}><b>{totals.PRESENT}</b></label>
							<label style={{ backgroundColor: "#fc6171"}}><b>{totals.ABSENT}</b></label>
							<label style={{ backgroundColor: "#e0e0e0"}}><b>{totals.LEAVE}</b></label>
							<label style={{ backgroundColor: "#bedcff"}}><b>{Math.round((1 - totals.ABSENT / (totals.PRESENT + totals.LEAVE)) * 100)}%</b></label>
						</div>
					]
				}
			</div> 
}

interface P {
	teachers: RootDBState["faculty"]
	settings: RootDBState["settings"]
	schoolLogo: RootDBState["assets"]["schoolLogo"]
}

interface S {
	filterText: string
	chartFilter: {
		present: boolean
		absent: boolean
		leave: boolean
		percentage: boolean
	},
	classFilter: string
}

type propTypes = RouteComponentProps & P
	
	
class TeacherAttendanceAnalytics extends Component < propTypes, S > {

	former: Former
	constructor(props: propTypes) {
	  super(props)
	
	  this.state = {
		 filterText: "",
		 chartFilter: {
			 present: true,
			 absent: true,
			 leave: true,
			 percentage: true
		 },
		 classFilter: ""
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
	
	render()
	{
		const { teachers, settings, schoolLogo } = this.props

		let totals = { PRESENT: 0, LEAVE: 0, ABSENT: 0 };
		let monthly_attendance : {[id: string]: Attendance } = { }
		let teacher_attendance : {[id: string]: TAttendance } = { }

		for(let [tid, teacher] of Object.entries(teachers)) {
	
			if(teacher.Name === undefined || teacher.attendance === undefined) {
				continue;
			}

			let t_record = { PRESENT: 0, LEAVE: 0, ABSENT: 0 }

			for(let [date, record] of Object.entries(teacher.attendance)) {

				const key = this.getKey(record)

				totals[key] += 1;
				t_record[key] += 1;

				const month_key = moment(date).format('MM/YYYY');
				const m_status = monthly_attendance[month_key] || { PRESENT: 0, LEAVE: 0, ABSENT: 0}
				m_status[key] += 1;
				monthly_attendance[month_key] = m_status;
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
			<label>Total Present</label>
			<div>{totals.LEAVE}</div>
		</div>
		<div className="table row">
			<label>Absentee Percent</label>
			<div>{(totals.ABSENT/totals.PRESENT * 100).toFixed(2)}%</div>
		</div>

		<div className="divider">Monthly Attendance</div>
		
		<div className="no-print">
			<MonthlyAttendanceChart
				monthly_attendance = { monthly_attendance }
				filter = { this.state.chartFilter }
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
		
		<MonthlyAttendanceTable
			monthly_attendance={monthly_attendance}
			totals={totals}
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
export default connect((state : RootReducerState ) =>({
	teachers: state.db.faculty,
	settings: state.db.settings,
	schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : ""
}))(TeacherAttendanceAnalytics)
