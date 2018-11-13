import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

import { createLogout } from 'actions'
import Layout from 'components/Layout'

import './style.css'

const Landing = ({ logout, user }) => {

	return <Layout>
		<div className="landing">
			<div className="row">
				<Link to="/attendance" className="button">Attendance</Link>
				<Link to="/class" className="button">Classes</Link>
			</div>
			<div className="row">
				<Link to="/student" className="button">Students</Link>
				<Link to="/teacher" className="button">Teachers</Link>
			</div>
			<div className="row">
				<Link to="/sms" className="button">SMS</Link>
				<Link to="/reports" className="button">Marks</Link>
			</div>
			<div className="row">
				<Link to="/settings" className="button">Settings</Link>
				<Link to="/analytics/fees" className="button">Analytics</Link>
			</div>
			<div className="row">
				<div className="button" onClick={logout}>Switch User</div>
			{ user.Admin ? <Link to="/teacher-attendance" className="button">Teacher Attendance</Link> : false }
			</div>
		</div>
	</Layout>
}

export default connect(state => ({ user: state.db.faculty[state.auth.faculty_id] }), 
dispatch => ({
	logout: () => dispatch(createLogout())
}))(Landing)