import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { createTemplateMerges } from 'actions'
import { mergeSettings, addLogo } from 'actions'
import Former from 'utils/former'
import Layout from 'components/Layout'
import Banner from 'components/Banner'
import newBadge from "../Landing/icons/New/new.svg";

import './style.css'

export const defaultPermissions = {
	fee:  { teacher: true },
	dailyStats: { teacher: true },
	setupPage: {teacher: true }
}

const defaultSettings = {
	shareData: true,
	schoolName: "",
	schoolAddress: "",
	schoolPhoneNumber: "",
	sendSMSOption: "SIM", // API
	permissions: defaultPermissions,
	devices: {}
}

class Settings extends Component {

	constructor(props){ 
		super(props);
		
		const settings = {
			...(props.settings || defaultSettings),
			permissions: {
				...defaultPermissions,
				...(props.settings || defaultSettings).permissions
			},
			devices: (props.settings ? (props.settings.devices || {}) : {})
		}
		this.state = {
			templates: this.props.sms_templates,
			settings,
			templateMenu: false,
			permissionMenu: false,
			banner: {
				active: false,
				good: true,
				text: "Saved!"
			},
			client_id : localStorage.getItem("client_id"),
			schoolLogo: props.schoolLogo
		}

		this.former = new Former(this, [])
	}

	changeTeacherPermissions = () => {

		return <div className="table">
			<div className="row">
				<label> Allow teacher to view Fee Information ? </label>
				<select {...this.former.super_handle(["settings", "permissions", "fee","teacher"])}>
							<option value={true}>Yes</option>
							<option value={false}>No</option>
						</select>
			</div>
			<div className="row">
				<label> Allow teacher to view Daily Statistics ? </label>
				<select {...this.former.super_handle(["settings", "permissions", "dailyStats","teacher"])}>
							<option value={true}>Yes</option>
							<option value={false}>No</option>
						</select>
			</div>
			<div className="row">
				<label> Allow teacher to view Setup Page ? </label>
				<select {...this.former.super_handle(["settings", "permissions", "setupPage","teacher"])}>
							<option value={true}>Yes</option>
							<option value={false}>No</option>
						</select>
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
		if(this.state.schoolLogo === "" || this.state.schoolLogo !== this.props.schoolLogo){
			this.props.addLogo(this.state.schoolLogo)
		}
		this.setState({templateMenu: false});
		
		this.setState({
			banner: {
				active: true,
				good: true,
				text: "Saved!"
			}
		})

		setTimeout(() => {
			this.setState({
				banner: {
					active: false
				}
			})
		}, 2000);
	}
	onLogoRemove = () => {
		this.setState({
			schoolLogo: ""
		})
		this.props.addLogo("")
		this.setState({
			banner: {
				active: true,
				good: false,
				text: "Logo Removed!"
			}
		})

		setTimeout(() => {
			this.setState({
				banner: {
					active: false
				}
			})
		}, 1000);
	}

	logoHandler = (e) => {

		var file = e.target.files[0];
		var reader = new FileReader();
		
		reader.onloadend = () => {
			this.setState({
				schoolLogo: reader.result
			})
		}
		reader.readAsDataURL(file);
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
			{ this.state.banner.active ? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false }

				<div className="title">Settings</div>

				<div className="form" style={{width: "90%"}}>

					<div className="row">
						<img className="school logo" src={this.state.schoolLogo} alt={"No Logo Found"}/> 
					</div>

					<div className="row">
						<label>School Logo</label>
						{this.state.schoolLogo === "" ?
						<div className="badge-container">
							<div className="fileContainer button green" style={{width:"90%"}}>
								<div>Select A Logo</div>
								<input type="file" onChange={this.logoHandler}/>
							</div>
							<img className="new-badge" src={newBadge}/>
						</div>
						: <div className="button red" onClick={this.onLogoRemove}> Remove </div>}

					</div>
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
							<option value={true}>Yes</option>
							<option value={false}>No</option>
						</select>
					</div>

					<div className="row">
						<label>Device Name</label>
						<input type="text" {...this.former.super_handle(["settings","devices", this.state.client_id ])} placeholder="Device Name" />
					</div>

					<div className="row">
					<label>MISchool Version</label>
					<label>{window.version || "no version set"}</label>
					</div>

					<div className="row">
					<label>Client Id</label>
					<label>{ this.state.client_id }</label>
					</div>


					<div className="row">
						<div className="button grey" onClick={() => this.setState({templateMenu : !this.state.templateMenu })}>
							Change SMS Templates
						</div>
					</div>
					{
						this.state.templateMenu ? this.changeSMStemplates() : false
					}
					{
						this.props.user.Admin ?
							<div className="row">
								<div className="button grey" onClick={() => this.setState({permissionMenu : !this.state.permissionMenu })}>
									Change Teacher Permissions
								</div>
							</div>
							: false
					}
					{
						this.state.permissionMenu ? this.changeTeacherPermissions() : false
					}

					<div className="row">
						<Link className="button grey" to="/settings/promote">Promote Students</Link>
					</div>

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
		sms_templates: state.db.sms_templates,
		schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : "" 
	}), 
	dispatch => ({
		saveTemplates: templates => dispatch(createTemplateMerges(templates)),
		saveSettings: settings => dispatch(mergeSettings(settings)),
		addLogo: logo_string => dispatch(addLogo(logo_string))
}))(Settings);
