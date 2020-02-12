import React, { Component } from 'react'
import { connect } from 'react-redux'

import Layout from 'components/Layout'
import { StudentList } from 'modules/Student/List'
import { TeacherList } from 'modules/Teacher/List'

import former from 'utils/former'
import { RouteComponentProps } from 'react-router';

// give option to select student list or class list, with forwardTo ---> reports.
// need to give this a route 

interface P {
	students: RootDBState["students"]
	classes: RootDBState["classes"]
	settings: RootDBState["settings"]
}

interface S {
	fee_for: "STUDENT" | "TEACHER"
}

interface RouteInfo {
	id: string
}

type propTypes = RouteComponentProps<RouteInfo> & P

class CerificateMenu extends Component <propTypes, S> {

	Former: former
	constructor( props: propTypes) {
		super(props);

		this.state = {
			fee_for: "STUDENT"
		}

		this.Former = new former(this, [])
	}

	render() {

		return <Layout history={this.props.history}>
			<div className="certificate-menu">
				<div className="title">Certificates</div>

				<div className="form" style={{ width: "90%" }}>
					<div className="row">
						<label>View Certificates For</label>
						<select {...this.Former.super_handle(["fee_for"])}>
							<option value="TEACHER">Teacher</option>
							<option value="STUDENT">Student</option>
						</select>
					</div>
				</div>

				<div className="sub-list" style={{width: "100%"}}>
				{ this.state.fee_for === "STUDENT" ? 
					<StudentList {...this.props} forwardTo="certificates" /> : <TeacherList {...this.props} forwardTo="certificates" /> }
				</div>

			</div>
		</Layout>
 
	}
}

export default connect((state: RootReducerState) => ({
	students: state.db.students,
	teachers: state.db.faculty,
	classes: state.db.classes,
	settings: state.db.settings,
}))(CerificateMenu)
