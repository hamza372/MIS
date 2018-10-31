import React, { Component } from 'react'
import { Route, Link } from 'react-router-dom'

import Layout from 'components/Layout'

import Create from './Create'
import Attendance from './Attendance'

import './style.css'

const New = () => {
	return <div>New thing</div>
}

export default class StudentPage extends Component {

	render() {
		
		const loc = this.props.location.pathname.split('/').slice(-1).pop();
		console.log("LOCLOC", loc)

		return <Layout>
			<div className="single-teacher">
				{ loc === "new" ? false : 
				<div className="row tabs">
					<Link className={`button ${loc === "profile" ? "selected" : false}`} to="profile" replace={true}>Profile</Link>
					<Link className={`button ${loc === "payment" ? "selected": false}`} to="payment" replace={true}>Payment</Link>
					<Link className={`button ${loc === "attendance" ? "selected" : false}`} to="attendance" replace={true}>Attendance</Link>
				</div>
				}

				<Route path="/faculty/first" component={Create} />
				<Route path="/faculty/new" component={Create} />
				<Route path="/faculty/:id/profile" component={Create} />
				<Route path="/faculty/:id/payment" component={New} />
				<Route path="/faculty/:id/attendance" component={Attendance} />
			</div>
		</Layout>
	}
}