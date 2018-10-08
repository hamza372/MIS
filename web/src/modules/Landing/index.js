import React from 'react'
import { Link } from 'react-router-dom'

import Layout from 'components/Layout'

import { connect } from 'react-redux'

import './style.css'

const Landing = (props) => {

	return <Layout>
		<div className="landing">
			<div className="row">
				<Link to="/attendance" className="button">Attendance</Link>
				<Link to="/class" className="button">Class</Link>
			</div>
			<div className="row">
				<Link to="/student" className="button">Students</Link>
				<Link to="/teacher" className="button">Teachers</Link>
			</div>
			<div className="row">
				<Link to="/sms" className="button">SMS</Link>
				<Link to="/reports" className="button">Reports</Link>
			</div>
			{ props.user.Admin ? <div className="row">
				<Link to="/teacher-attendance" className="button">Teacher Attendance</Link>
			</div> : false
			}
		</div>
	</Layout>
}

export default connect(state => ({ user: state.db.faculty[state.auth.faculty_id] }))(Landing)