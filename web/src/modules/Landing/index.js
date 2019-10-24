import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import moment from 'moment'

import { createLogout } from 'actions'
import Layout from 'components/Layout'
import { numberWithCommas } from '../../utils/numberWithCommas'

import attendanceIcon from './icons/attendance/checklist_1.svg'            //
import teacherAttendanceIcon from './icons/attendance/Attendance.svg'    //
import feesIcon from './icons/fees/accounting.svg'          //no-icon
import marksIcon from './icons/Marks/exam.svg'                     //
import analyticsIcon from './icons/Analytics/increasing-stocks-graphic-of-bars.svg'   //
import resultIcon from './icons/result_card/exam-a-plus.svg'
import smsIcon from './icons/SMS/sms_1.svg'                       //
import teachersIcon from './icons/Teacher/teacher_1.svg'          //
import studentsIcon from './icons/Student/student_profile_1.svg'  //
import classesIcon from './icons/Classes/classes_1.svg'           //
import settingsIcon from './icons/Settings/settings-gears.svg'    //
import switchUserIcon from './icons/switch_user/logout.svg'    //no-icon
import prospective from './icons/Prospective/prospective.svg'
import planner from './icons/Planner/planner.svg'
import cerificate from './icons/Certificate/certificate1.svg'
import expense from './icons/Expense/expense.svg'
import newBadge from "./icons/New/new.svg";
import family from "./icons/family/family.svg"

import Help from './icons/Help/help.svg'
import diary from './icons/Diary/diary.svg'

/**
 * line for adding new badge just copy / paste it
 * 
 *	<img className="new-badge" src={newBadge}/>
 */

import './style.css'

class Landing extends Component {

	constructor(props) {
		super(props);

		this.state = {
			scroll: 0
		}
	}


	componentDidMount() {
		const container = document.querySelector(".landing .horizontal-scroll-container");

		container.onscroll = () => this.setState({ scroll: container.scrollLeft })
		container.scrollTo(window.innerWidth, 0)


		this.setState({
			scroll: container.scrollLeft
		})
	}

	componentWillUnmount() {
		window.onscroll = {}
	}

	getDailyStatsRoute = (stats_type) => {
		return `/analytics/${stats_type}?start_date=${moment().format('MM-DD-YYYY')}&end_date=${moment().format('MM-DD-YYYY')}&period=Daily`
	}

	render() {

		const { logout, user, students, faculty, lastSnapshot, unsyncd, permissions } = this.props;

		const current_page = Math.floor(this.state.scroll / window.innerWidth);

		const today_date = moment().format("YYYY-MM-DD");

		let today_attendance = { PRESENT: 0, LEAVE: 0, SICK_LEAVE:0, CASUAL_LEAVE:0, SHORT_LEAVE:0, ABSENT: 0 }
		let today_payment = 0;
		let today_payment_students = 0;
		let today_teacher_attendance = { PRESENT: 0, LEAVE: 0, ABSENT: 0 }
		
		const setupPage = permissions && permissions.setupPage ? permissions.setupPage.teacher : true
		const dailyStats = permissions && permissions.dailyStats ? permissions.dailyStats.teacher : true
		const teacher_fee_permission = permissions && permissions.fee ? permissions.fee.teacher : true;
		const teacher_expense_permission = permissions && permissions.expense ? permissions.expense.teacher : true;


		for(let student of Object.values(students)) {

			const record = (student.attendance || {})[today_date];
			if(record) {
				today_attendance[record.status] += 1;
			}

			const additional_payment = Object.values(student.payments || {})
				.filter(x => moment(x.date).format("YYYY-MM-DD") === today_date && x.type === "SUBMITTED")
				.reduce((agg, curr) => agg + curr.amount, 0);

			if(additional_payment > 0) {
				today_payment_students += 1
			}

			today_payment += additional_payment;
		}

		for(let teacher of Object.values(faculty)) {
			const record = (teacher.attendance || {})[today_date];

			if(record === undefined) {
				continue;
			}

			if(record.check_in) {
				today_teacher_attendance.PRESENT += 1
			}
			else if(record.absent) {
				today_teacher_attendance.ABSENT += 1;
			}
			else if(record.leave) {
				today_teacher_attendance.LEAVE += 1;
			}
		}

		return <Layout history={this.props.history}>
			<div className="landing">
				<div className="horizontal-scroll-container">

					<div className="page">
						<div className="title">Setup</div>
						{ user.Admin || setupPage ? <div className="row">
							<Link to="/teacher" className="button green-shadow" style={{backgroundImage: `url(${teachersIcon})`}}>Teachers</Link>
							<Link to="/student" className="button blue-shadow" style={{backgroundImage: `url(${studentsIcon})` }}>Students</Link>
						</div> : false}
						
						{ user.Admin || setupPage ? <div className="row">
							<Link to="/class" className="button purple-shadow" style={{backgroundImage: `url(${classesIcon})` }}>Classes</Link>
							<Link to="/settings" className="button red-shadow" style={{backgroundImage: `url(${settingsIcon})` }}>Settings</Link>
						</div> : false}
						<div className="row">
							<div className="badge-container">
								<Link to="/student?forwardTo=prospective-student" className="button yellow-shadow" style={{backgroundImage: `url(${prospective})` }}>Prospective</Link>
							</div>
							<Link to="/help" className="button grey-shadow" style={{backgroundImage: `url(${Help})` }}>Help</Link>
						</div>
						<div className="row">
						{
							user.Admin && 
								<Link 
									to="/certificate-menu"
									className="button purple-shadow"
									style={{backgroundImage: `url(${cerificate})`}}>
									Certificates
								</Link> 
						}
							<div className="button yellow-shadow" onClick={logout} style={{backgroundImage: `url(${switchUserIcon})` }}>Logout</div>
						</div>
						<div className="row">
                            <div className="badge-container">
                                <img className="new-badge" src={newBadge} alt=""/>
                                <Link to="/families"
                                    className="button green-shadow"
                                    style={{ backgroundImage: `url(${family})`}}>
                                    Families
                                </Link>
                            </div>
						</div>
					</div>

					<div className="page">
						<div className="title">Actions</div>
						<div className="row">
							<Link to="/attendance" className="button green-shadow" style={{backgroundImage: `url(${attendanceIcon})` }}>Attendance</Link>
							{ user.Admin ? <Link to="/teacher-attendance" className="button red-shadow" style={{backgroundImage: `url(${teacherAttendanceIcon})` }}>Teacher Attendance</Link> : false }
						</div>
						
						<div className="row">

							<div className="badge-container">
								<Link
									to="/diary"
									className="button purple-shadow"
									style={{ backgroundImage: `url(${diary})` }}>
									Diary
								</Link>
							</div>
							<Link
								to="/reports"
								className="button yellow-shadow"
								style={{ backgroundImage: `url(${marksIcon})` }}>
								Marks
							</Link>

						</div>

						<div className="row">

							<Link
								to="/sms" className="button red-shadow"
								style={{ backgroundImage: `url(${smsIcon})` }}>
								SMS
							</Link>

							<Link
								to="/reports-menu"
								className="button green-shadow"
								style={{ backgroundImage: `url(${resultIcon})` }}>
								Result Card
							</Link>

						</div>
						<div className="row">
						{ 
							user.Admin ||  teacher_fee_permission ?
							<Link 
								to= "/fee-menu" 
								className="button blue-shadow" 
								style={{backgroundImage: `url(${feesIcon})` }}>Fees</Link> 
								
							: false 
						}
						{
							user.Admin || teacher_fee_permission ? 
								<Link to="/analytics/fees" className="button purple-shadow" style={{backgroundImage: `url(${analyticsIcon})` }}>Analytics</Link> 
								: false
						}
						</div>

						<div className="row">
							<Link
								to="/ClassList" className="button grey-shadow"
								style={{ backgroundImage: `url(${planner})` }}>
								DateSheet
							</Link>
							{
							(user.Admin || teacher_expense_permission) && <div className="badge-container">
								<Link
									className="button yellow-shadow"
									to="/expenses/general"
									style={{ backgroundImage: `url(${expense})`}}>
									Expenses 
								</Link>
								</div>
							}
						</div>
					</div>

					{ user.Admin || dailyStats ? <div className="page">
						<div className="title">Daily Statistics</div>
						<div className="divider">Attendance</div>
						<div className="row">
							<Link 
								className="box no-underline bg-green" 
								to = {this.getDailyStatsRoute('attendance')}>
								<div>{today_attendance.PRESENT}</div>
								<div>Present</div>
							</Link>

							<Link 
								className="box no-underline bg-red"
								to = {this.getDailyStatsRoute('attendance')}>
								<div>{today_attendance.ABSENT}</div>
								<div>Absent</div>
							</Link>

							<Link 
								className="box no-underline bg-grey"
								to = {this.getDailyStatsRoute('attendance')}>
								<div>{today_attendance.LEAVE + today_attendance.SHORT_LEAVE + today_attendance.SICK_LEAVE + today_attendance.CASUAL_LEAVE }</div>
								<div>Leave</div>
							</Link>
						</div>

						<div className="divider">Teacher Attendance</div>
						<div className="row">
							<Link 
								className="box no-underline bg-green" 
								to = {this.getDailyStatsRoute('teacher-attendance')}>
								<div>{today_teacher_attendance.PRESENT}</div>
								<div>Present</div>
							</Link>

							<Link 
								className="box no-underline bg-red"
								to = {this.getDailyStatsRoute('teacher-attendance')}>
								<div>{today_teacher_attendance.ABSENT}</div>
								<div>Absent</div>
							</Link>
							
							<Link
								className="box no-underline bg-grey"
								to = {this.getDailyStatsRoute('teacher-attendance')}>
								<div>{today_teacher_attendance.LEAVE}</div>
								<div>Leave</div>
							</Link>
						</div>

						<div className="divider">Fee Collection</div>
						<div className="row">
							<Link
								className="box no-underline bg-blue"
								to = {this.getDailyStatsRoute('fees')}>
								<div>{numberWithCommas(today_payment)}</div>
								<div>Rupees</div>
							</Link>

							<Link
								className="box no-underline bg-green"
								to = {this.getDailyStatsRoute('fees')}>
								<div>{today_payment_students}</div>
								<div>Students</div>
							</Link>
						</div>

						<div className="divider">Last Backup</div>
						<div className="row">
							<div className="box bg-purple">
								<div>{moment(lastSnapshot).format("HH:mm")}</div>
								<div>{moment(lastSnapshot).format("D-M-YYYY")}</div>
							</div>
							<div className="box bg-grey">
								<div>{unsyncd}</div>
								<div>{unsyncd === 1 ? "Unsyncd Change" : "Unsynced Changes"}</div>
							</div>
						</div>

					</div> : false }

				</div>
			</div>

			{window.innerWidth > 1200 ? false : 
			<div className="scroll-indicator-container">
				<div className={`scroll-indicator ${current_page === 0 ? "active" : ""}`} />
				<div className={`scroll-indicator ${current_page === 1 ? "active" : ""}`} />
				{user.Admin || dailyStats ? <div className={`scroll-indicator ${current_page === 2 ? "active" : ""}`} /> : false}
			</div> }
		</Layout>
	}
}


export default connect(state => ({ 
		user: state.db.faculty[state.auth.faculty_id],
		students: state.db.students,
		faculty: state.db.faculty,
		permissions: state.db.settings.permissions,
		lastSnapshot: state.lastSnapshot,
		unsyncd: Object.keys(state.queued).length
	}), 
	dispatch => ({
		logout: () => dispatch(createLogout())
	}))(Landing)
