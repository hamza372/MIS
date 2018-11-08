import React, { Component } from 'react'
import { connect } from 'react-redux'

import { mergeSettings } from 'actions'
import Former from 'utils/former'
import Layout from 'components/Layout'

const defaultSettings = {
	shareData: true,
	schoolName: ""
}
class Settings extends Component {

	constructor(props){ 
		super(props);
		this.state = {
			settings: props.settings || defaultSettings
		}
		this.former = new Former(this, ["settings"])
	}

	onSave = () => {
		this.props.saveSettings(this.state.settings)
	}

	componentWillReceiveProps(nextProps) {
		console.log(nextProps)

		this.setState({
			settings: nextProps.settings
		})
	}

	render() {
		return <Layout>
			<div className="settings">
				<div className="title">Settings</div>

				<div className="form">
					<div className="row">
						<label>School Name</label>
						<input type="text" {...this.former.super_handle(["schoolName"])} placeholder="School Name" />
					</div>
					<div className="row">
						<label>Data Sharing</label>
						<select {...this.former.super_handle(["shareData"])}>
							<option value={true}>Yes, share anonymous data with CERP</option>
							<option value={false}>No, don't share data</option>
						</select>
					</div>

					<div className="button save" onClick={this.onSave}>Save</div>
				</div>
			</div>
		</Layout>
	}
}

export default connect(state => ({ settings: state.db.settings }), dispatch => ({
	saveSettings: settings => dispatch(mergeSettings(settings))
}))(Settings);