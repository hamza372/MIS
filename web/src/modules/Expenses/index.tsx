import React, { Component } from 'react'
import { Route, Link, RouteComponentProps } from 'react-router-dom'
import { connect } from 'react-redux'

import Layout from '../../components/Layout'

import Expenses from '../../modules/Expenses/General';

import './style.css'


interface P {
	user: MISTeacher,
	permissions: RootDBState["settings"]["permissions"]
}

interface RouteInfo {
	id: string
}

type propTypes = RouteComponentProps <RouteInfo> & P


class ExpensePage extends Component <propTypes> {

	render() {
		// three buttons, 

		// if student is new, just render the profile. when they hit save, redirect to the right page.
		
		const loc = this.props.location.pathname.split('/').slice(-1).pop();
		const admin = this.props.user.Admin;
		const permissions = this.props.permissions;

		return <Layout history={this.props.history}>
			<div className="expense-page">
				<div className="row tabs">
					{ 
						admin || permissions.fee.teacher ?
						<Link
							className={`button ${loc === "expenses" ? "green": false}`}
							to="expenses"
							replace={true}
							> 
							General
						</Link> : false 
					}
				</div>

				<Route path="/expenses/" component={Expenses} />

			</div>
		</Layout>
	}
}
export default connect((state: RootReducerState) => ({  
	user: state.db.faculty[state.auth.faculty_id],
	permissions: state.db.settings.permissions,
}))(ExpensePage)