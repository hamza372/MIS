import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import former from '../../../../utils/former'

import { PrintHeader } from '../../../../components/Layout'

import './style.css'
import { RouteComponentProps } from 'react-router';

interface P {
	faculty: RootDBState["faculty"]
	settings: RootDBState["settings"]
	schoolLogo: RootDBState["assets"]["schoolLogo"]
}

interface S {
	monthFilter: string
	yearFilter: string
}

interface Routeinfo {
	id: string
}

type propTypes = P & RouteComponentProps<Routeinfo>

class FacultyAttendance extends Component< propTypes, S> {

	former: former
	constructor( props: propTypes) {

		super(props)

		this.state = {
			monthFilter: "",
			yearFilter: moment().format("YYYY")
		}

		this.former = new former(this, []);
	}
	
	getAttendanceFilterCondition = (date: string) =>{
		//when both are empty
		if(this.state.monthFilter === "" && this.state.yearFilter === "") {
			return true
		}
		//when month is empty	
		if(this.state.monthFilter === "" && this.state.yearFilter !== ""){
			return  moment(date).format("YYYY") === this.state.yearFilter;

		}
		//when year is empty
		if(this.state.monthFilter !== "" && this.state.yearFilter === ""){
			return moment(date).format("MMMM") === this.state.monthFilter

		}
		//when both are not empty
		if(this.state.monthFilter !== "" && this.state.yearFilter !== "")
		{
			return moment(date).format("MMMM") === this.state.monthFilter && moment(date).format("YYYY") === this.state.yearFilter;
		}
	}

	render() {

		const id = this.props.match.params.id;
		const faculty = this.props.faculty[id];

		const attendance = faculty.attendance;

		const Months = new Set()
		const Year = new Set()

		Object.keys(attendance).forEach(date => {
			const formatted = moment(date, "YYYY-MM-DD")
			Months.add(formatted.format("MMMM"))
			Year.add(formatted.format("YYYY"))
		})

		/*
		const { PRESENT: num_present, ABSENT: num_absent, LEAVE: num_leave } = Object.values(attendance)
			.reduce((agg, curr) => {
				agg[curr.status] += 1;
				return agg;
			}, {PRESENT: 0, ABSENT: 0, LEAVE: 0})
		*/
		/*
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
				<div>{num_leave}</div>
			</div>
			<div className="row">
				<label>Percentage:</label>
				<div>{(num_present / (num_absent + num_present) * 100).toFixed(2)}%</div>
			</div>
		*/

		return <div className="faculty-attendance">
			<PrintHeader settings={this.props.settings} logo={this.props.schoolLogo} />

			<div className="divider">Record</div>

			<div className="row no-print">
				<select {...this.former.super_handle(["monthFilter"])} style={{margin: "4px 2px"}}>
					<option value=""> Select</option>
					{
						[...Months]
						.map(month => <option key={month} value={month}>{month}</option>)
					}
				</select>

				<select {...this.former.super_handle(["yearFilter"])} style={{margin:"4px 2px"}}>
					<option value=""> Select</option>
					{
						[...Year]
						.map(year => <option key={year} value={year}>{year}</option>)
					}
				</select>
				<div className="row" style={{justifyContent:"flex-end", margin:"4px 2px"}}>
					<div className="button blue" onClick={() => window.print()}>Print</div>
				</div>

			</div>

			<div className="section">
			<div className="row">
				<div style={{marginBottom:"2px"}}> <b>Date</b></div>
				<label style={{marginBottom:"2px"}}><b>Status</b></label>
			</div>
			{
				Object.entries(attendance)
				.filter(([date,]) => this.getAttendanceFilterCondition(date))
				.sort(([dateA,], [dateB,])=> moment(dateB).diff(moment(dateA)) )
				.map(
					([date, rec]) => {
						return <div className="row" key={date}>
							<label>{moment(date).format("DD-MM")}</label>
							{ rec.check_in && rec.check_out ? <div>In: {moment(rec.check_in).format("HH:mm")} Out: {moment(rec.check_out).format("HH:mm")}</div> : false}
							{ rec.check_in && !rec.check_out ? <div>In: {moment(rec.check_in).format("HH:mm")}</div> : false}
							{ rec.absent ? <div>Absent</div> : false }
							{ rec.leave ? <div>Leave</div> : false }
						</div>
					}
			)}
			</div>
			<div className="row">
			</div>

		</div>
	}
}

export default connect(
	(state : RootReducerState) => ({ 
		faculty: state.db.faculty,
		settings: state.db.settings,
		schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : "" 
	}),
	dispatch => ({ }) )(FacultyAttendance)