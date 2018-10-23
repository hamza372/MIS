import React, { Component } from 'react'
import {Route, Link} from 'react-router-dom'

import Layout from 'components/Layout'
import Create from './Create'
// import Exams from './Exams'

import './style.css'

export default (props) => {

	const loc = props.location.pathname.split('/').slice(-1).pop();
	/*
			{
			loc === "new" ? false : 

				<div className="row-tabs">
					<Link className={`button ${loc === "profile" ? "selected" : false}`} to="profile" replace={true}>Profile</Link>
					<Link className={`button ${loc === "exams" ? "selected" : false}`} to="exams" replace={true}>Exams</Link>
				</div>
			}

			<Route path="/class/:id/exams" component={Exams} />
	*/

	return <Layout>
		<div className="single-class-container">
			<Route path="/class/new" component={Create} />
			<Route path="/class/:id/profile" component={Create} />
		</div>
	</Layout>

}