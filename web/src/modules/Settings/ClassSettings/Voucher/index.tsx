import React, { Component } from 'react'
import Banner from 'components/Banner'
import Former from 'utils/former'
import { connect } from 'react-redux'
import { mergeSettings } from 'actions'

import './../style.css'

interface P {
	classes: RootDBState["classes"]
	settings: RootDBState["settings"]

	mergeSettings: (settings: RootDBState["settings"]) => void
}

type S = {
	banner: {
		active: boolean
		good?: boolean
		text?: string
	}
} & MISSettings["classes"]["feeVoucher"]

class VoucherSettings extends Component<P, S> {

	former: Former
	constructor(props: P) {
		super(props)

		const settings = this.props.settings
		const feeVoucher = settings.classes && settings.classes.feeVoucher ? settings.classes.feeVoucher : this.setFeeVoucherSetings()

		this.state = {

			banner: {
				active: false,
				good: false,
				text: ""
			},
			...feeVoucher
		}

		this.former = new Former(this, [])
	}

	setFeeVoucherSetings = (): MISSettings["classes"]["feeVoucher"] => {
		return {
			dueDays: "",
			feeFine: "",
			notice: "",
			bankInfo: {
				name: "",
				accountTitle: "",
				accountNo: ""
			},
			options: {
				showDueDays: false,
				showFine: false,
				showNotice: false,
				showBankInfo: false
			}
		}
	}

	onSaveFeeVoucher = (): void => {

		const { dueDays, feeFine, notice, bankInfo, options } = this.state
		const settings = this.props.settings

		let modified_settings: MISSettings

		if (settings && settings.classes) {
			modified_settings = {
				...settings,
				classes: {
					...settings.classes,
					feeVoucher: {
						dueDays,
						feeFine,
						notice,
						bankInfo,
						options
					}
				}
			}
		} else {
			modified_settings = {
				...settings,
				classes: {
					defaultFee: {},
					feeVoucher: {
						dueDays,
						feeFine,
						notice,
						bankInfo,
						options
					}
				}
			}
		}

		this.setState({
			banner: {
				active: true,
				good: true,
				text: "Voucher Settings has been saved!"
			}
		})

		// updating MISSettings
		this.props.mergeSettings(modified_settings)

		setTimeout(() => this.setState({ banner: { active: false } }), 3000)
	}

	render() {

		return <div className="class-settings fee-voucher">
			{this.state.banner.active ? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false}
			<div className="divider">Fee Voucher</div>
			<div className="section form fee-voucher">
				<div className="row">
					<label>No. of Fee due Days</label>
					<input type="number" {...this.former.super_handle(["dueDays"])}
						placeholder="e.g. 2 days after first of each month" />
				</div>
				<div className="row">
					<label>Late Fee Fine</label>
					<input type="number"{...this.former.super_handle(["feeFine"])}
						placeholder="e.g. Rs. 10 per day" />
				</div>
				<div className="row">
					<label>Fee Notice</label>
					<textarea {...this.former.super_handle(["notice"])}
						placeholder="School fee notice for the students" style={{ borderRadius: 4 }} />
				</div>
				<div>
					<fieldset>
						<legend>Bank Information</legend>
						<div className="row">
							<label>Bank Name</label>
							<input type="text" {...this.former.super_handle(["bankInfo", "name"])}
								placeholder="e.g. HBL" />
						</div>
						<div className="row">
							<label>Account Title</label>
							<input type="text" {...this.former.super_handle(["bankInfo", "accountTitle"])}
								placeholder="e.g. MISCHOOL" />
						</div>
						<div className="row">
							<label>Account No</label>
							<input type="text" {...this.former.super_handle(["bankInfo", "accountNo"])}
								placeholder="e.g. 01782338901" />
						</div>
					</fieldset>
				</div>
				<div>
					<fieldset>
						<legend>Options</legend>
						<div className="row">
							<label>Show Due Date</label>
							<input type="checkbox" {...this.former.super_handle(["options", "showDueDays"])}></input>
						</div>
						<div className="row">
							<label>Show Fine</label>
							<input type="checkbox" {...this.former.super_handle(["options", "showFine"])}></input>
						</div>
						<div className="row">
							<label>Show Notice</label>
							<input type="checkbox" {...this.former.super_handle(["options", "showNotice"])}></input>
						</div>
						<div className="row">
							<label>Show Bank Info</label>
							<input type="checkbox" {...this.former.super_handle(["options", "showBankInfo"])}></input>
						</div>
					</fieldset>
				</div>
				<div className="button blue" style={{ marginTop: 10 }} onClick={this.onSaveFeeVoucher}>Save</div>
			</div>
		</div>
	}
}
export default connect((state: RootReducerState) => ({
	classes: state.db.classes,
	settings: state.db.settings
}), (dispatch: Function) => ({
	mergeSettings: (settings: RootDBState["settings"]) => dispatch(mergeSettings(settings)),
}))(VoucherSettings)