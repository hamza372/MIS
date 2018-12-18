import React, { Component } from 'react'
import { ClassReports }  from '../../Single/Reports'

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
			<div className="form no-print" style={{width: "90%", margin: "auto"}}>
				<div className="row">
					<label>Start Date</label>
					<input type="date" onChange={this.report_former.handle(["start"])} value={moment(this.state.report_dates.start).format("YYYY-MM-DD")} placeholder="Start Date" />
				</div>
				<div className="row">
					<label>End Date</label>
					<input type="date" onChange={this.report_former.handle(["end"])} value={moment(this.state.report_dates.end).format("YYYY-MM-DD")} placeholder="End Date" />
				</div>
			</div>
			<ClassReports
					id={this.props.curr_class.id}
					classes={this.props.classes}
					students={this.props.students}
					exams={this.props.exams}
					settings={this.props.settings}
					sms_templates={this.props.sms_templates}
					start={moment(this.state.report_dates.start)} 
					end={moment(this.state.report_dates.end)} 
					/>
		</div>
	}
}
 
export default connect((state, { match: { params: { id } } }) => ({
	 curr_class: state.db.classes[id],
	 classes : state.db.classes,
	 students: state.db.students,
	 settings: state.db.settings,
	 exams: state.db.exams,
	 sms_templates: state.db.sms_templates
}))(ClassReportMenu)
