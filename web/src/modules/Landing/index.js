import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

import { createLogout } from 'actions'
import Layout from 'components/Layout'

import './style.css'

const Landing = ({ logout, user }) => {

	return <Layout>
		<div className="landing">
			
			<div className="title" >Hello, {user.Name}!</div>
			
			<div className="row">
				<Link to="/attendance" className="button orange-shadow">Attendance</Link>
				<Link to="/student" className="button blue-shadow">Students</Link>
			</div>
			
			<div className="row">
				<Link to="/teacher" className="button green-shadow">Teachers</Link>
				<Link to="/class" className="button purple-shadow">Classes</Link>
			</div>
			
			<div className="row">
				<Link to="/reports" className="button yellow-shadow">Marks</Link>
				<Link to="/analytics/fees" className="button blue-shadow">Analytics</Link>
			</div>

			<div className="row">
				<Link to="/sms" className="button orange-shadow">SMS</Link>
				<Link to="/settings" className="button purple-shadow">Settings</Link>
			</div>
			
			<div className="row">
				<div className="button yellow-shadow" onClick={logout}>Switch User</div>
			{ user.Admin ? <Link to="/teacher-attendance" className="button blue-shadow">Teacher Attendance</Link> : false }
			</div>
		</div>
	</Layout>
}

export default connect(state => ({ user: state.db.faculty[state.auth.faculty_id] }), 
dispatch => ({
	logout: () => dispatch(createLogout())
}))(Landing)