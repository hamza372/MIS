import React, { Component } from 'react'
import { connect } from 'react-redux';
import Former from 'former';
import StudentAttendance from './StudentAttendance'
import TeacherAttendance from './TeacherAttendance';
import Fees from './Fees';
import Exams from './Exams';
import { RouteComponentProps } from 'react-router';

import './style.css'
import { schoolInfo } from '../../actions';

interface P {
	school_list: RootReducerState["school_Info"]["school_list"]
	schoolInfo: () => any
}

interface S {
	selected_school: string
}

interface RouteInfo {
	id: string
}

type propTypes = RouteComponentProps<RouteInfo> & P

class Stats extends Component <propTypes, S> {

	former: Former
	constructor(props: propTypes) {
		super(props)
	
		this.state = {
			selected_school: ""
		}

		this.former = new Former(this,[])

	}

	componentDidMount () {
		this.props.schoolInfo()
	}
	
	render() {

		console.log(this.props)
		const { school_list} = this.props

		const start_date = '2018-10-15'
		const end_date = '2019-12-19'

		console.log("School List",school_list)
		return <div className="page stats">

			<div className="title">Stats</div>
			<div className="section form">
				<div className="row">
					<label>School</label>
					<select {...this.former.super_handle(["selected_school"])}>
					<option value="">Select</option>
					{
						school_list.map(s => <option value={s} key={s}> {s} </option>)
					}
					</select>
				</div>
			</div>
			
			<div className="divider">Student Attendance</div>
			<StudentAttendance school_id={this.state.selected_school} start_date={start_date} end_date={end_date}/>

			<div className="divider">Teacher Attendance</div>
			<TeacherAttendance school_id={this.state.selected_school} start_date={start_date} end_date={end_date}/>
			
			{/* <div className="divider">Student Fee</div>
			<Fees school_id={this.state.selected_school} start_date={start_date} end_date={end_date}/>
 */}			
			<div className="divider">Student Exams</div>
			<Exams school_id={this.state.selected_school} start_date={start_date} end_date={end_date}/>
		</div>
	}
}

export default connect((state : RootReducerState) => ({
	school_list: state.school_Info.school_list
}), ( dispatch: Function )  => ({
	schoolInfo: () => dispatch(schoolInfo())
}))(Stats)
