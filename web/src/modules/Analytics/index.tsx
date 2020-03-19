import React, { Component } from 'react'
import { Route, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router-dom'

import Layout from 'components/Layout'

import Fees from './Fees'
import Attendance from './Attendance'
import ExpenseAnalytics from './Expenses'
import TeacherAttendanceAnalytics from './Teacher-Attendance'
import ExamsAnalytics from './Exams/index'

import './style.css'

type P = RootReducerState & RouteComponentProps

class Analytics extends Component<P> {

	render() {

		const loc = this.props.location.pathname.split('/').slice(-1).pop();

		return <Layout history={this.props.history}>
			<div className="analytics">
				<div className="row tabs">
					<Link className={`button ${loc === "fees" ? "orange" : ''}`} to="fees" replace={true}>Fees</Link>
					<Link className={`button ${loc === "attendance" ? "blue" : ''}`} to="attendance" replace={true}>Attendance</Link>
					<Link className={`button ${loc === "teacher-attendance" ? "red" : ''}`} to="teacher-attendance" replace={true}>Teacher Attendance</Link>
					<Link className={`button ${loc === "expenses" ? "green" : ''}`} to="expenses" replace={true}>Expenses</Link>
					<Link className={`button ${loc === "exams" ? "blue" : ''}`} to="exams" replace={true}>Exams</Link>
				</div>

				<Route path="/analytics/fees" component={Fees} />
				<Route path="/analytics/attendance" component={Attendance} />
				<Route path="/analytics/expenses" component={ExpenseAnalytics} />
				<Route path="/analytics/teacher-attendance" component={TeacherAttendanceAnalytics} />
				<Route path="/analytics/exams" component={ExamsAnalytics} />
			</div>
		</Layout>
	}
}

export default connect((state: RootReducerState) => ({ db: state.db }))(Analytics)