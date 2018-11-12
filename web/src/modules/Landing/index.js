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
				<Link to="/attendance" className="button orange">Attendance</Link>
				<Link to="/class" className="button blue">Classes</Link>
			</div>
			<div className="row">
				<Link to="/student" className="button blue">Students</Link>
				<Link to="/teacher" className="button orange">Teachers</Link>
			</div>
			<div className="row">
				<Link to="/sms" className="button orange">SMS</Link>
				<Link to="/reports" className="button blue">Marks</Link>
			</div>
			<div className="row">
				<Link to="/settings" className="button blue">Settings</Link>
				<Link to="/analytics/fees" className="button orange">Analytics</Link>
			</div>
			<div className="row">
				<div className="button orange" onClick={logout}>Switch User</div>
			{ user.Admin ? <Link to="/teacher-attendance" className="button blue">Teacher Attendance</Link> : false }
			</div>
		</div>
	</Layout>
}

export default connect(state => ({ user: state.db.faculty[state.auth.faculty_id] }), 
dispatch => ({
	logout: () => dispatch(createLogout())
}))(Landing)