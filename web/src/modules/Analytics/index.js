import React, { Component } from 'react'
import { Route, Link } from 'react-router-dom'
import { connect } from 'react-redux'

import Layout from 'components/Layout'

import Fees from './Fees'
import Attendance from './Attendance'
import ExpenseAnalytics from './Expenses'

import './style.css'

class Analytics extends Component {

	render() {

		const loc = this.props.location.pathname.split('/').slice(-1).pop();

		return <Layout history={this.props.history}>
			<div className="analytics">
				<div className="row tabs">
					<Link className={`button ${loc === "fees" ? "orange" : false}`} to="fees" replace={true}>Fees</Link>
					<Link className={`button ${loc === "attendance" ? "blue" : false}`} to="attendance" replace={true}>Attendance</Link>
					<Link className={`button ${loc === "expenses" ? "green" : false}`} to="expenses" replace={true}>Expenses</Link>
				</div>

				<Route path="/analytics/fees" component={Fees} />
				<Route path="/analytics/attendance" component={Attendance} />
				<Route path="/analytics/expenses" component={ExpenseAnalytics} />
			</div>
		</Layout>
	}
}

export default connect(state => ({ db: state.db }))(Analytics);