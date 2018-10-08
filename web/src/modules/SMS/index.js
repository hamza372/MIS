import React, { Component } from 'react'
import { connect } from 'react-redux'

import { createTemplateMerges } from 'actions'
import former from 'utils/former'
import Layout from 'components/Layout'
import Banner from 'components/Banner'


import './style.css'

const defaultTemplates = () => ({
	attendance: "$NAME has been marked as $STATUS",
	fee: "$NAME has just paid $AMOUNT PKR. Your balance is now $BALANCE.",
	result: "$NAME has a new report ready.\n$REPORT"
})

class SMS extends Component {

	constructor(props) {
		super(props);

		this.state = {
			templates: Object.keys(this.props.sms_templates).length === 0 ? defaultTemplates() : this.props.sms_templates,
			banner: {
				active: false,
				good: true,
				text: "Saved!"
			},
			text: "",
			selected_student_number: ""
		}
		console.log(this.state.templates)

		this.former = new former(this, [])
	}

	save = () => {
		console.log("SAVE")

		this.props.saveTemplates(this.state.templates);

		this.setState({
			banner: {
				active: true,
				good: true,
				text: "Saved!"
			}
		})

		setTimeout(() => this.setState({ banner: {active: false}}), 3000);
	}

	render() {
		return <Layout>
			<div className="sms-page">
				{ this.state.banner.active ? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false }

				<div className="title">SMS Management</div>
				<div className="form">

					<div className="divider">Send Message</div>
					<div className="section">
						<div className="row">
							<label>Select Student</label>
							<select {...this.former.super_handle(["selected_student_number"])}>
								{
									Object.entries(this.props.students)
									.filter(([id, student]) => student.Phone !== undefined && student.Phone !== "")
									.map(([id, student]) => <option key={id} value={student.Phone}>{student.Name}</option>)
								}
							</select>
						</div>
						<div className="row">
							<label>Message</label>
							<textarea {...this.former.super_handle(["text"])} placeholder="Write text message here" />
						</div>
					</div>
					<div className="divider">Attendance Template</div>
					<div className="section">
						<div className="row"><div>Use $NAME to insert the child's name.</div></div>
						<div className="row"><div>Use $STATUS to insert the attendance status.</div></div>
						<div className="row">
							<label>SMS Template</label>
							<textarea {...this.former.super_handle(["templates", "attendance"])} placeholder="Enter SMS template here" />
						</div>
					</div>

					<div className="divider">Fees Template</div>
					<div className="section">
						<div className="row"><div>Use $NAME to insert the child's name.</div></div>
						<div className="row"><div>Use $AMOUNT to insert the fee amount.</div></div>
						<div className="row"><div>Use $BALANCE to insert the total fee balance.</div></div>
						<div className="row">
							<label>SMS Template</label>
							<textarea {...this.former.super_handle(["template", "fee"])} placeholder="Enter SMS template here" />
						</div>
					</div>

					<div className="divider">Results Template</div>
					<div className="section">
						<div className="row">
							<div>Use $NAME to insert the child's name.</div>
						</div>
						<div className="row">
							<div>Use $REPORT to send report line by line.</div>
						</div>
						<div className="row">
							<label>SMS Template</label>
							<textarea {...this.former.super_handle(["template", "result"])} placeholder="Enter SMS template here" />
						</div>

					</div>

					<div className="button save" onClick={this.save}>Save</div>
				</div>
			</div>
		</Layout>
	}
}

export default connect(state => ({ sms_templates: state.db.sms_templates, students: state.db.students }), dispatch => ({
	saveTemplates: templates => dispatch(createTemplateMerges(templates))
}))(SMS);