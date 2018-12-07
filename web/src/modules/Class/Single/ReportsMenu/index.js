import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import { connect } from 'react-redux'

import Former from 'utils/former'


class ClassReportMenu extends Component {

	constructor(props) {
		super(props);

		this.state = {
			report_dates: {
				start: moment().subtract(3, "month").unix() * 1000,
				end: moment.now(),
				exam_name: ""
			}
		}

		this.report_former = new Former(this, ["report_dates"])
	}

	render() {
		return <div className="class-report-menu" style={{width: "100%"}}>
			<div className="title">Print Reports for {this.props.curr_class.name}</div>
			<div className="form" style={{width: "90%", margin: "auto"}}>
				<div className="row">
					<label>Start Date</label>
					<input type="date" onChange={this.report_former.handle(["start"])} value={moment(this.state.report_dates.start).format("YYYY-MM-DD")} placeholder="Start Date" />
				</div>
				<div className="row">
					<label>End Date</label>
					<input type="date" onChange={this.report_former.handle(["end"])} value={moment(this.state.report_dates.end).format("YYYY-MM-DD")} placeholder="End Date" />
				</div>
				<Link className="button grey block" to={`reports/${moment(this.state.report_dates.start).unix() * 1000}/${moment(this.state.report_dates.end).unix() * 1000}`}>Print Preview</Link>
			</div>
		</div>
	}
}

export default connect((state, { match: { params: { id } } }) => ({ curr_class: state.db.classes[id] }))(ClassReportMenu)