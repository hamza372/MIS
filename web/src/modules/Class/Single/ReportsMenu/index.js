import React, { Component } from 'react'
import { ClassReports }  from '../../Single/Reports'

import moment from 'moment'
import { connect } from 'react-redux'

import Former from 'utils/former'


class ClassReportMenu extends Component {

	constructor(props) {
		super(props);

		this.state = {
			report_filters: {
				start: moment().subtract(3, "month").unix() * 1000,
				end: moment.now(),
				exam_name: "",
				examFilterText: "",
				subjectFilterText: ""
			}
					}
		this.report_former = new Former(this, ["report_filters"])
	}

	render() {
		
		const subjects = new Set()
		const exams = new Set()
		const section_set = new Set(Object.keys(this.props.curr_class.sections));
		
		const relevant_students = Object.values(this.props.students)
			.filter(s => section_set.has(s.section_id))

		for(let s of relevant_students)
		{
			for(let e of Object.values(this.props.exams))
			{ 
				if(e.section_id === s.section_id){
					subjects.add(e.subject)
					exams.add(e.name)
				}
			}
		}

		return <div className="class-report-menu" style={{width: "100%"}}>
			<div className="title no-print">Print Reports for {this.props.curr_class.name}</div>
			<div className="form no-print" style={{width: "90%", margin: "auto"}}>
				<div className="row">
					<label>Start Date</label>
					<input type="date" onChange={this.report_former.handle(["start"])} value={moment(this.state.report_filters.start).format("YYYY-MM-DD")} placeholder="Start Date" />
				</div>
				<div className="row">
					<label>End Date</label>
					<input type="date" onChange={this.report_former.handle(["end"])} value={moment(this.state.report_filters.end).format("YYYY-MM-DD")} placeholder="End Date" />
				</div>

				<div className="row">
					<label>Exam Name</label>
					<select {...this.report_former.super_handle(["examFilterText"])}> 
					<option value="">Select Exam</option>
					{
						Array.from(exams).map(exam => {
							return <option key={exam} value={exam}>{exam}</option>	
						})
					}
					</select>
				</div> 
				<div className="row">
					<label>Subject Name</label>
					<select {...this.report_former.super_handle(["subjectFilterText"])}> 
					<option value="">Select Subject</option>
					{
						Array.from(subjects).map(subject => {
							return <option key={subject} value={subject}>{subject}</option>	
						})
					}
					</select>						
				</div>
			</div>
			<ClassReports
					id={this.props.curr_class.id}
					classes={this.props.classes}
					students={this.props.students}
					exams={this.props.exams}
					settings={this.props.settings}
					sms_templates={this.props.sms_templates}
					start={moment(this.state.report_filters.start)} 
					end={moment(this.state.report_filters.end)}
					examFilter={this.state.report_filters.examFilterText}
					subjectFilter={this.state.report_filters.subjectFilterText} 
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
