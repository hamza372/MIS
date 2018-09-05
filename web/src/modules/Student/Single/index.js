import React, { Component } from 'react'
import { Route, Link } from 'react-router-dom'

import Create from './Create'
import Layout from 'components/Layout'

import './style.css'

const New = () => {
	return <div>New thing</div>
}
export default class StudentPage extends Component {

	render() {
		// three buttons, 

		// if student is new, just render the profile. when they hit save, redirect to the right page.

		return <Layout>
			<div className="single-student">
				{ this.props.location.pathname.indexOf("new") >= 0 ? false : 
				<div className="row tabs">
					<Link className="button" to="profile">Profile</Link>
					<Link className="button" to="payment">Payment</Link>
					<Link className="button" to="attendance">Attendance</Link>
				</div>
				}

				<Route path="/student/new" component={Create} />
				<Route path="/student/:id/profile" component={Create} />
				<Route path="/student/:id/payment" component={New} />
				<Route path="/student/:id/attendance" component={New} />
			</div>
		</Layout>
	}
}