import React, { Component } from 'react'
import { connect } from 'react-redux'

import Layout from '../../components/Layout'
import StudentList from '../../modules/Student/List'
import { ClassListModule } from '../../modules/Class/List'

import former from '../../utils/former'
import { RouteComponentProps } from 'react-router';

// give option to select student list or class list, with forwardTo ---> reports.
// need to give this a route 

interface P {
	students: RootDBState["students"]
	classes: RootDBState["classes"]
	settings: RootDBState["settings"]
}

interface S {
	report_for: string
}

interface RouteInfo {
	id: string
}

type propTypes = RouteComponentProps <RouteInfo> & P

class ReportsMenu extends Component <propTypes, S> {

	Former: former
	constructor(props : propTypes) {
		super(props);

		this.state = {
			report_for: "CLASS" // enum CLASS | STUDENT
		}

		this.Former = new former(this, [])
	}

	render() {

		return <Layout history={this.props.history}>
			<div className="reports-menu">
				<div className="title">Reports</div>

				<div className="form" style={{ width: "90%" }}>
					<div className="row">
						<label>View Reports For</label>
						<select {...this.Former.super_handle(["report_for"])}>
							<option value="CLASS">Class</option>
							<option value="STUDENT">Student</option>
						</select>
					</div>
				</div>

				<div className="sub-list" style={{width: "100%"}}>
				{ this.state.report_for === "CLASS" ? 
					<ClassListModule {...this.props} forwardTo="report-menu" /> : <StudentList {...this.props} forwardTo="marks" /> }
				</div>

			</div>
		</Layout>
 
	}

}

export default connect((state: RootReducerState) => ({
	students: state.db.students,
	classes: state.db.classes,
	settings: state.db.settings,
}))(ReportsMenu)


