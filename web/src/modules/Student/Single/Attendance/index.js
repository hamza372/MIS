import React, { Component } from 'react'
import { connect } from 'react-redux'
import { PrintHeader } from 'components/Layout'
import moment from 'moment'
import former from 'utils/former'
import sortYearMonths from 'utils/sortUtils'

import './style.css'

class StudentAttendance extends Component {

	constructor(props) {
		super(props)

		this.state = {
			filter: {
				month: "",
				year: ""
			}
		}

		this.former = new former(this, ["filter"])
	}

	getFilterCondition = (time, month, year) => {

		if(month === "" && year === "") {
			return true
		} 
		
		if(month === "" && year !== "") {
			return moment(time).format("YYYY") === year
		}
		
		if(month !== "" && year === "") {
			return moment(time).format("MMMM") === month
		} 
		
		if(month !== "" && year !== "") {
			return moment(time).format("MMMM") === month && moment(time).format("YYYY") === year;
		}
	}

	render() {

		const id = this.props.match.params.id;
		const student = this.props.students[id];
		const attendance = Object.values(student.attendance || {})
		
		let months = new Set()
		let years = new Set()
		let filtered_attendance = []

		for(const item of attendance) {
			months.add(moment(item.time).format("MMMM"))
			years.add(moment(item.time).format("YYYY"))
			
			if(this.getFilterCondition(item.time, this.state.filter.month, this.state.filter.year)) {
				filtered_attendance.push(item)
			}
		}

		const { PRESENT: num_present, ABSENT: num_absent, 
				LEAVE: num_leave, SICK_LEAVE: num_sick_leave,
				SHORT_LEAVE: num_short_leave, CASUAL_LEAVE: num_casual_leave  
			} = filtered_attendance.reduce((agg, curr) => {
					agg[curr.status] += 1;
					return agg;
			}, {PRESENT: 0, ABSENT: 0, LEAVE: 0, SICK_LEAVE: 0, SHORT_LEAVE: 0, CASUAL_LEAVE: 0})
		
		const total_leave_count = num_leave + num_sick_leave + num_short_leave + num_casual_leave

		return <div className="student-attendance" style={{margin: "0"}}>

			<PrintHeader settings={this.props.settings} logo={this.props.schoolLogo} />

			<div className="print-only">
				<div className="divider">{student.Name + "'s Attendance Record"}</div>
			</div>
			<div className="row">
				<label>Days Present:</label>
				<div>{num_present}</div>
			</div>
			<div className="row">
				<label>Days Absent:</label>
				<div>{num_absent}</div>
			</div>
			<div className="row">
				<label>Days on Leave:</label>
				<div>{total_leave_count}</div>
			</div>
			<div className="row">
				<label>Present Percentage:</label>
				<div>{(num_present / (num_absent + num_present + total_leave_count) * 100).toFixed(2)}%</div>
			</div>
			<div className="no-print">
				<select {...this.former.super_handle(["month"])}>
					<option value="">Select Month</option>
					{
						sortYearMonths(months).map(month => {
							return <option key={month} value={month}>{month}</option>	
						})
					}
				</select>

				<select {...this.former.super_handle(["year"])}>
					<option value="">Select Year</option>
					{ 
						Array.from(years).map(year => {
							return <option key={year} value={year}>{year}</option>
						})
					}
				</select>
			</div>

			<div className="row">
				<div className="print button" onClick={() => window.print()}>Print</div>
			</div>
			
			<div className="divider">Record</div>
			<div className="section">
			{ filtered_attendance
				.sort((a, b) => b.time - a.time) // intentionally sort in desc order
				.map(item => <div className="row" key={item.date}>
						<label>{moment(item.date).format("DD-MM-YYYY")}</label>
						<div>{item.status}</div>
					</div>)
			}
			</div>
		</div>
	}
}

export default connect(state => ({ 
	students: state.db.students,
	settings: state.db.settings,
	schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : "" 
 }))(StudentAttendance)