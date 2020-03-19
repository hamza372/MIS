import React, { Component } from 'react'
import { connect } from 'react-redux'
import Layout from 'components/Layout'
import { StudentList } from 'modules/Student/List'
import { ClassListModule } from 'modules/Class/List'
import former from 'utils/former'
import { RouteComponentProps } from 'react-router'
import queryString from 'query-string'

// give option to select student list or class list, with forwardTo ---> reports.
// need to give this a route 

interface P {
	students: RootDBState["students"]
	classes: RootDBState["classes"]
	settings: RootDBState["settings"]
}

interface S {
	fee_for: string
}

interface RouteInfo {
	id: string
}

type propTypes = RouteComponentProps<RouteInfo> & P

class FeeMenu extends Component<propTypes, S> {

	Former: former
	constructor(props: propTypes) {
		super(props)

		const parsed_query = queryString.parse(this.props.location.search)
		const fee_for = parsed_query.forward ? parsed_query.forward.toString().toUpperCase() : 'STUDENT'

		this.state = {
			fee_for
		}

		this.Former = new former(this, [])
	}

	UNSAFE_componentWillReceiveProps(nextProps: propTypes) {

		const parsed_query = queryString.parse(nextProps.location.search)
		const fee_for = parsed_query.forward ? parsed_query.forward.toString().toUpperCase() : 'STUDENT'

		this.setState({ fee_for })
	}

	onChange = () => {

		const { fee_for } = this.state
		const url = '/fee-menu'
		let params = `forward=${fee_for.toLowerCase()}`

		window.history.replaceState(this.state, "Fee Menu", `${url}?${params}`)
	}

	render() {

		return <Layout history={this.props.history}>
			<div className="reports-menu">
				<div className="title">Fee Menu</div>

				<div className="section-container form">
					<div className="row">
						<label>View Fees For</label>
						<select {...this.Former.super_handle(["fee_for"], () => true, this.onChange)}>
							<option value="CLASS">Class</option>
							<option value="STUDENT">Student</option>
						</select>
					</div>
				</div>

				<div className="sub-list" style={{ width: "100%" }}>
					{this.state.fee_for === "STUDENT" ?
						<StudentList {...this.props} forwardTo="payment" /> : <ClassListModule {...this.props} forwardTo="fee-menu" />}
				</div>

			</div>
		</Layout>

	}
}

export default connect((state: RootReducerState) => ({
	students: state.db.students,
	classes: state.db.classes,
	settings: state.db.settings,
}))(FeeMenu)
