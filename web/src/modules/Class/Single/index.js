import React from 'react'
import {Route} from 'react-router-dom'

import Layout from 'components/Layout'
import Create from './Create'

import './style.css'

export default (props) => {

	return <Layout>
		<div className="single-class-container">
			<Route path="/class/new" component={Create} />
			<Route path="/class/:id/profile" component={Create} />
		</div>
	</Layout>

}