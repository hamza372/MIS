import React, { Component } from 'react'
import { Route, Link } from 'react-router-dom'
import { connect } from 'react-redux'

import Layout from 'components/Layout'

import Create from './Create'
import Attendance from './Attendance'
import StudentFees from './Fees'
import Marks from './Marks'
import StudentCertificates from './Certificates'
import printPreview from './Fees/printPreview'

import './style.css'

class StudentPage extends Component {

	render() {
		// three buttons, 

		// if student is new, just render the profile. when they hit save, redirect to the right page.
		
		const loc = this.props.location.pathname.split('/').slice(-1).pop();
		const admin = this.props.user.Admin;
		const permissions = this.props.permissions;

		return <Layout history={this.props.history}>
			<div className="single-student">
				{ loc === "new" || loc === "prospective-student" ? false : 
				<div className="row tabs">
					<Link className={`button ${loc === "profile" ? "red" : false}`} to="profile" replace={true}>Profile</Link>
					{ admin || permissions.fee.teacher ?
						<Link className={`button ${loc === "payment" ? "green": false}`} to="payment" replace={true}> 
						Payment
						</Link> : false }
					<Link className={`button ${loc === "attendance" ? "purple" : false}`} to="attendance" replace={true}>Attendance</Link>
					<Link className={`button ${loc === "marks" ? "blue" : false}`} to="marks" replace={true}>Marks</Link>
					<Link className={`button ${loc === "certificates" ? "yellow" : false}`} to="certificates" replace={true}>Certificates</Link>
				</div>
				}

				<Route path="/student/new" component={Create} />
				<Route path="/student/:id/profile" component={Create} />
				<Route path="/student/:id/payment" component={StudentFees} />
				<Route path="/student/:id/fee-print-preview" component={printPreview} />
				<Route path="/student/:id/attendance" component={Attendance} />
				<Route path="/student/:id/marks" component={Marks} />

				<Route path="/student/:id/prospective-student" component={Create} />
				<Route path="/student/prospective-student/new" component={Create} />
				<Route path="/student/:id/certificates" component={StudentCertificates} />
			</div>
		</Layout>
	}
}
export default connect(state => ({  
	user: state.db.faculty[state.auth.faculty_id],
	permissions: state.db.settings.permissions,
}))(StudentPage)