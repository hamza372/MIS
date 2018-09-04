import React from 'react'
import { Link } from 'react-router-dom'

import Layout from 'components/Layout'

import './style.css'

const Landing = (props) => {

	return <Layout>
		<div className="landing">
			<Link to="/teacher" className="button">Teachers</Link>
			<Link to="/student" className="button">Students</Link>
		</div>
	</Layout>
}

export default Landing;