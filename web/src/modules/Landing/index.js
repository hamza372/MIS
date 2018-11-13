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
				<Link to="/student" className="button">Students</Link>
			</div>
			<div className="row">
				<Link to="/teacher" className="button">Teachers</Link>
				<Link to="/class" className="button">Classes</Link>
			</div>
			<div className="row">
				<Link to="/reports" className="button">Marks</Link>
				<Link to="/analytics/fees" className="button">Analytics</Link>
			</div>
			<div className="row">
				<Link to="/sms" className="button">SMS</Link>
				<Link to="/settings" className="button">Settings</Link>
			</div>
			<div className="row">
			{ user.Admin ? <Link to="/teacher-attendance" className="button ">Teacher Attendance</Link> : false }
				<div className="button" onClick={logout}>Switch User</div>
			</div>
		</div>
	</Layout>
}

export default connect(state => ({ user: state.db.faculty[state.auth.faculty_id] }), 
dispatch => ({
	logout: () => dispatch(createLogout())
}))(Landing)