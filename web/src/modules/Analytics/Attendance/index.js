import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import moment from 'moment'

import { ResponsiveContainer, BarChart, Bar, Legend, XAxis, YAxis, ComposedChart, Line, Tooltip } from 'recharts'

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

		<div className="divider">Attendance per Month</div>
		<ResponsiveContainer width="100%" height={500}>
			<ComposedChart data={Object.entries(monthly_attendance)
				.sort(([month, ], [m2, ]) => month.localeCompare(m2))
				.map(([month, { student, PRESENT, LEAVE, ABSENT }]) => ({
					month, PRESENT, LEAVE, ABSENT, percent: (1 - ABSENT / (PRESENT + LEAVE)) * 100
				}))}>
				<Legend />
				<XAxis dataKey="month"/>
				<YAxis />
				<Tooltip />
				<Bar dataKey="PRESENT" stackId="a" fill="#95B8D1" name="Present" />
				<Bar dataKey="ABSENT" stackId="a" fill="#EDAFB8" name="Absent" />
				<Bar dataKey="LEAVE" stackId="a" fill="#aaaaaa" name="Leave" />
				<Line dataKey="percent" stroke="#222222" name="Percentage" />
			</ComposedChart>
		</ResponsiveContainer>

		<div className="divider">Student Attendance</div>
		<div className="table row">
				<label><b>Name</b></label>
				<label><b>Days Absent</b></label>
		</div>
		{
			Object.entries(student_attendance)
				.sort(([, { ABSENT: a1 }], [, {ABSENT: a2}]) => a2 - a1)
				.map(([ sid, { student, PRESENT, ABSENT, LEAVE } ]) => <div className="table row">
					<Link to={`/student/${sid}/attendance`}>{student.Name}</Link>
					<div>{ABSENT}</div>
				</div>)
		}
	</div>

})