import React from 'react'
import {Route, Link} from 'react-router-dom'
import Layout from 'components/Layout'

import Create from './Create'
import ReportMenu from './ReportsMenu'
import Reports from './Reports'

import './style.css'

export default (props) => {

		const loc = props.location.pathname.split('/').slice(-1).pop();

	return <Layout>
		<div className="single-class-container">

			{loc === "new" ? false : 
				<div className="row tabs">
					<Link className={`button ${loc === "profile" ? "red" : false}`} to="profile" replace={true}>Profile</Link>
					<Link className={`button ${loc === "report-menu" ? "purple" : false}`} to="report-menu" replace={true}>Reports</Link>
				</div>
			}

			<Route path="/class/new" component={Create} />
			<Route path="/class/:id/profile" component={Create} />
			<Route path="/class/:id/reports/:start/:end" component={Reports} />
			<Route path="/class/:id/report-menu" component={ReportMenu} />

		</div>
	</Layout>
}