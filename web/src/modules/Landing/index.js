import React from 'react'
import Link from 'components/Link'

import Layout from 'components/Layout'

import './style.css'

const Landing = (props) => {

	return <Layout>
		<div className="landing">
			<Link to="/teacher">Teachers</Link>
			<Link to="/student">Students</Link>
		</div>
	</Layout>
}

export default Landing;