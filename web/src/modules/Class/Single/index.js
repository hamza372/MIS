import React from 'react'
import { Route, Link } from 'react-router-dom'
import Layout from 'components/Layout'

import Create from './Create'
import ReportMenu from './ReportsMenu'
import FeeMenu from './ClassFeeMenu'
import { connect } from 'react-redux'

import './style.css'

export default connect(state => ({ 
	permissions: state.db.settings.permissions
}))((props) => {
		const splits = props.location.pathname.split('/')
		const loc = splits.slice(-1).pop();
		const isPrintPage = splits.length === 6 && splits[3] === "reports"
		const setupPage = props.permissions && props.permissions.setupPage ? props.permissions.setupPage.teacher : true
		
return <Layout history={props.history}>
		<div className="single-class-container" style={{display: "block", overflow: "hidden"}}>

			{loc === "new" || isPrintPage ? false : 
				setupPage ? <div className="row tabs">
					<Link className={`button ${loc === "profile" ? "red" : false}`} to="profile" replace={true}>Profile</Link>
					<Link className={`button ${loc === "report-menu" ? "purple" : false}`} to="report-menu" replace={true}>Result Cards</Link>
				</div> : false}

			<Route path="/class/new" component={Create} />
			<Route path="/class/:id/profile" component={Create} />
			<Route path="/class/:class_id/:section_id/report-menu" component={ReportMenu} />
			<Route path="/class/:id/fee-menu" component={FeeMenu} />

		</div>
	</Layout>
})