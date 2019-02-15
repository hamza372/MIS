import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import moment from 'moment'

import { ResponsiveContainer, Bar, Legend, XAxis, YAxis, ComposedChart, Line, Tooltip } from 'recharts'

const MonthlyAttendanceChart = (props) => {

		const monthly_attendance = props.monthly_attendance;
		
		return <ResponsiveContainer width="100%" height={200}>
					<ComposedChart 
						data={Object.entries(monthly_attendance)
						.sort(([month, ], [m2, ]) => month.localeCompare(m2))
						.map(([month, { student, PRESENT, LEAVE, ABSENT }]) => ({
							month, PRESENT, LEAVE, ABSENT, percent: (1 - ABSENT / (PRESENT + LEAVE)) * 100
						}))}>
							<Legend />
							<XAxis dataKey="month"/>
							<YAxis />
							<Tooltip />
							<Bar dataKey="PRESENT" stackId="a" fill="#5ecdb9" name="Present" />
							<Bar dataKey="ABSENT" stackId="a" fill="#ff6b68" name="Absent" />
							<Bar dataKey="LEAVE" stackId="a" fill="#e0e0e0" name="Leave" />
							<Line dataKey="percent" stroke="#222222" name="Percentage" />
					</ComposedChart>  
			</ResponsiveContainer>
}
const MonthlyAttendanceTable = (props) =>{
	const monthly_attendance = props.monthly_attendance;
	const total = props.totals;

	return <div className="section table">
				<div className="table row heading">
					<label><b>Date</b></label>
					<label><b>Present</b></label>
					<label><b>Absent</b></label>
					<label><b>Leave</b></label>
					<label><b>Absentee(%)</b></label>
				</div>

				
				{
					[...Object.entries(monthly_attendance)
						.sort(([month, ], [m2, ]) => month.localeCompare(m2))
						.map(([month, {student ,PRESENT, LEAVE, ABSENT} ]) => 
														
							<div className="table row">
								<div>{month }</div>
								<div>{PRESENT}</div>
								<div>{ABSENT}</div>
								<div>{LEAVE}</div>
								<div>{ Math.round((1 - ABSENT / (PRESENT + LEAVE)) * 100)}%</div>
							</div>
						),				
							
							 <div className="table row footing" key={Math.random()}>   
								<label><b>Total</b></label>
								<label><b>{total.PRESENT}</b></label>
								<label><b>{total.ABSENT}</b></label>
								<label><b>{total.LEAVE}</b></label>
								<label><b>{Math.round((1 - total.ABSENT / (total.PRESENT + total.LEAVE)) * 100)}%</b></label>
							</div>
					]
				}
			</div> 
				
}

export default connect(state => ({
	students: state.db.students
}))(({ students }) => {
	
	let totals = { PRESENT: 0, LEAVE: 0, ABSENT: 0 };
	let monthly_attendance = { } // [mm/yyyy]: { present / absent / leave }
	let student_attendance = { } // [id]: { absents, presents, leaves }

	for(let [sid, student] of Object.entries(students)) {

		let s_record = { PRESENT: 0, LEAVE: 0, ABSENT: 0 }

		for(let [date, record] of Object.entries(student.attendance)) {

			totals[record.status] += 1;
			s_record[record.status] += 1;

			const month_key = moment(date).format('MM/YYYY');
			const m_status = monthly_attendance[month_key] || { PRESENT: 0, LEAVE: 0, ABSENT: 0}
			m_status[record.status] += 1;
			monthly_attendance[month_key] = m_status;
		}
		student_attendance[sid] = {student, ...s_record}
	}

	return <div className="attendance-analytics">
		
		 {/** <div className="table row">
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
		</div> */}

		<div className="divider">Monthly Attendance</div>
		
			<MonthlyAttendanceChart monthly_attendance = {monthly_attendance} />
			<MonthlyAttendanceTable monthly_attendance={monthly_attendance} totals={totals} />

		
		
		<div className="divider">Student Attendance</div>
		<div className="table row">
				<label><b>Name</b></label>
				<label><b>Days Absent</b></label>
		</div>
		{
			Object.entries(student_attendance)
				.sort(([, { ABSENT: a1 }], [, {ABSENT: a2}]) => a2 - a1)
				.filter(([ sid, { student } ]) => (student.tags === undefined ) || (!student.tags["PROSPECTIVE"]) )
				.map(([ sid, { student, PRESENT, ABSENT, LEAVE } ]) => <div className="table row">
					<Link to={`/student/${sid}/attendance`}>{student.Name}</Link>
					<div>{ABSENT}</div>
				</div>)
		}
	</div>

})