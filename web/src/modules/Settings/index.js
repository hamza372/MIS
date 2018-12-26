import React, { Component } from 'react'
import { connect } from 'react-redux'

import { createTemplateMerges } from 'actions'
import { mergeSettings } from 'actions'
import { mergePermissions } from 'actions'

import Former from 'utils/former'
import Layout from 'components/Layout'

const defaultSettings = {
	shareData: true,
	schoolName: "",
	schoolAddress: "",
	schoolPhoneNumber: "",
	sendSMSOption: "SIM", // API
	permissions: {
		addTeacher:		 { teacher: true },
		addClass:   	 { teacher: true },
		addStudent: 	 { teacher: true },
		fee: 			 { teacher: true },
		analyticsModule: { teacher: true }
	}
}

class Settings extends Component {$Name

	constructor(props){ 
		super(props);
		this.state = {
			templates: this.props.sms_templates,
			settings: props.settings || defaultSettings,
			templateMenu: false,
			permissionMenu: false
		}

		this.former = new Former(this, [])
	}

	changeTeacherPermissions = () => {
		/* this.setState({ permissions : {
			...this.state.permissions,
			addTeacher: false
		}}) */ 
		return <div className="table">

			<div className="row">
				<label> Add Teacher </label>
				<input type="checkbox" {...this.former.super_handle(["settings", "permissions", "addTeacher","teacher"])}/>
			</div>
			<div className="row">
				<label> Add Class </label>
				<input type="checkbox" {...this.former.super_handle(["settings", "permissions", "addClass","teacher"])}/>
			</div>
			<div className="row">
				<label> Add Student </label>
				<input type="checkbox" {...this.former.super_handle(["settings", "permissions", "addStudent","teacher"])}/>
			</div>
			<div className="row">
				<label> Fee </label>
				<input type="checkbox" {...this.former.super_handle(["settings", "permissions", "fee","teacher"])}/>
			</div>
			<div className="row">
				<label> Analytics </label>
				<input type="checkbox" {...this.former.super_handle(["settings", "permissions", "analyticsModule","teacher"])}/>
			</div>
		</div>
	}

	changeSMStemplates = () => {
		return <div>
			<div className="divider">Attendance Template</div>
			<div className="section">
				<div className="row"><div>Use <code>$NAME</code> to insert the child's name.</div></div>
				<div className="row"><div>Use <code>$STATUS</code> to insert the attendance status.</div></div>
				<div className="row">
					<textarea {...this.former.super_handle(["templates", "attendance"])} placeholder="Enter SMS template here" />
				</div>
			</div>

			<div className="divider">Fees Template</div>
			<div className="section">
				<div className="row"><div>Use <code>$NAME</code> to insert the child's name.</div></div>
				<div className="row"><div>Use <code>$AMOUNT</code> to insert the fee amount.</div></div>
				<div className="row"><div>Use <code>$BALANCE</code> to insert the total fee balance.</div></div>
				<div className="row">
					<label>SMS Template</label>
					<textarea {...this.former.super_handle(["templates", "fee"])} placeholder="Enter SMS template here" />
				</div>
			</div>

			<div className="divider">Results Template</div>
			<div className="section">
				<div className="row">
					<div>Use <code>$NAME</code> to insert the child's name.</div>
				</div>index.
				<div className="row">
					<div>Use <code>$REPORT</code> to send report line by line.</div>
				</div>
				<div className="row">
					<label>SMS Template</label>
					<textarea {...this.former.super_handle(["templates", "result"])} placeholder="Enter SMS template here" />
				</div>
			</div>
		</div>
	}

	onSave = () => {
		this.props.saveSettings(this.state.settings);
		this.props.saveTemplates(this.state.templates);
		this.props.savePermissions(this.state.settings.permissions);
		this.setState({templateMenu: false});
	}

	componentWillReceiveProps(nextProps) {
		console.log(nextProps)

		this.setState({
			settings: nextProps.settings
		})
	}

	render() {
		return <Layout history={this.props.history}>
			<div className="settings" style={{ width: "100%" }}>
				<div className="title">Settings</div>

				<div className="form" style={{width: "90%"}}>
					<div className="row">
						<label>School Name</label>
						<input type="text" {...this.former.super_handle(["settings", "schoolName"])} placeholder="School Name" />
					</div>

					<div className="row">
						<label>School Address</label>
						<input type="text" {...this.former.super_handle(["settings", "schoolAddress"])} placeholder="School Address" />
					</div>

					<div className="row">
						<label>School Phone Number</label>
						<input type="text" {...this.former.super_handle(["settings", "schoolPhoneNumber"])} placeholder="School Phone Number" />
					</div>

					<div className="row">
						<label>SMS Option</label>
						<select {...this.former.super_handle(["settings", "sendSMSOption"])}>
							<option value="">Select SMS Option</option>
							<option value="SIM">Send SMS from Local SIM Card</option>
							<option value="API" disabled>Send SMS from API</option>
						</select>
					</div>
					<div className="row">
						<label>Data Sharing</label>
						<select {...this.former.super_handle(["settings", "shareData"])}>
							<option value={true}>Yes, share anonymous data with CERP</option>
							<option value={false}>No, don't share data</option>
						</select>
					</div>

					<div className="button grey" onClick={() => this.setState({templateMenu : !this.state.templateMenu })}>
						Change SMS Templates
					</div>
					{
						this.state.templateMenu ? this.changeSMStemplates() : false
					}

					{
						this.props.user.Admin ?
							<div className="button grey" onClick={() => this.setState({permissionMenu : !this.state.permissionMenu })}>
								Change Teacher Permissions
							</div>
							: false
					}
					{
						this.state.permissionMenu ? this.changeTeacherPermissions() : false
					}
					</div>
					<div className="button save" onClick={this.onSave} style={{ marginTop: "15px", marginRight: "5%", alignSelf: "flex-end" }}>Save</div>
				</div>
		</Layout>
	}
}

export default connect(
	state => ({ 
		settings: state.db.settings,
		user: state.db.faculty[state.auth.faculty_id], 
		sms_templates: state.db.sms_templates 
	}), 
	dispatch => ({
		saveTemplates: templates => dispatch(createTemplateMerges(templates)),
		saveSettings: settings => dispatch(mergeSettings(settings)),
		savePermissions: permissions => dispatch(mergePermissions(permissions))
}))(Settings);