import React, { Component } from 'react'
import { Route, Link } from 'react-router-dom'

import Layout from 'components/Layout'

import Create from './Create'
import Attendance from './Attendance'
import Fees from './Fees'

import './style.css'

export default class StudentPage extends Component {

	render() {
		// three buttons, 

		// if student is new, just render the profile. when they hit save, redirect to the right page.
		
		const loc = this.props.location.pathname.split('/').slice(-1).pop();

		return <Layout>
			<div className="single-student">
				{ loc === "new" ? false : 
				<div className="row tabs">
					<Link className={`button ${loc === "profile" ? "selected" : false}`} to="profile">Profile</Link>
					<Link className={`button ${loc === "payment" ? "selected": false}`} to="payment">Payment</Link>
					<Link className={`button ${loc === "attendance" ? "selected" : false}`} to="attendance">Attendance</Link>
				</div>
				}

				<Route path="/student/new" component={Create} />
				<Route path="/student/:id/profile" component={Create} />
				<Route path="/student/:id/payment" component={Fees} />
				<Route path="/student/:id/attendance" component={Attendance} />
			</div>
		</Layout>
	}
}