import React, { Component } from 'react'
import { Route, Link } from 'react-router-dom'

import Layout from 'components/Layout'

import Create from './Create'
import Attendance from './Attendance'
import TeacherCertificates from './Certificates'

import './style.css'

const New = () => {
	return <div>New thing</div>
}

export default class TeacherPage extends Component {

	render() {
		
		const loc = this.props.location.pathname.split('/').slice(-1).pop();

		return <Layout history={this.props.history}>
			<div className="single-teacher">
				{ loc === "new" ? false : 
				<div className="row tabs">
					<Link className={`button ${loc === "profile" ? "orange" : false}`} to="profile" replace={true}>Profile</Link>
					<Link className={`button ${loc === "attendance" ? "purple" : false}`} to="attendance" replace={true}>Attendance</Link>
					<Link className={`button ${loc === "certificates" ? "yellow" : false}`} to="certificates" replace={true}>Certificates</Link>
				</div>
				}

				<Route path="/faculty/first" component={Create} />
				<Route path="/faculty/new" component={Create} />
				<Route path="/faculty/:id/profile" component={Create} />
				<Route path="/faculty/:id/payment" component={New} />
				<Route path="/faculty/:id/attendance" component={Attendance} />
				<Route path="/faculty/:id/certificates" component={TeacherCertificates} />
			</div>
		</Layout>
	}
}