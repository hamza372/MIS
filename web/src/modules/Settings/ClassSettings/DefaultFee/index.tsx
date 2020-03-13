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
	selected_class_id: string
	fee: MISStudentFee
	banner: {
		active: boolean
		good?: boolean
		text?: string
	}
}

class DefaultFeeSettings extends Component<P, S> {

	former: Former
	constructor(props: P) {
		super(props)

		this.state = {
			fee: this.setDefaultFee(),
			selected_class_id: "",
			banner: {
				active: false,
				good: false,
				text: ""
			},
		}

		this.former = new Former(this, [])
	}

	setDefaultFee = (): MISStudentFee => {
		return {
			name: "",
			type: "FEE",
			amount: "",
			period: "MONTHLY"
		}
	}

	onSectionChange = () => {

		const settings = this.props.settings
		const class_id = this.state.selected_class_id

		if (settings.classes && settings.classes.defaultFee[class_id]) {
			this.setState({
				fee: settings.classes.defaultFee[class_id]
			})
		} else {

			this.setState({
				fee: this.setDefaultFee()
			})
		}
	}

	isDisabled = (): boolean => {

		const amount = this.state.fee.amount.trim()
		const name = this.state.fee.name.trim()
		const class_id = this.state.selected_class_id

		return amount.length === 0 || isNaN(parseFloat(amount)) || name.length === 0 || class_id === ""
	}

	onSaveDefaultFee = (): void => {

		if (this.isDisabled())
			return

		const amount = parseFloat(this.state.fee.amount)
		const settings = this.props.settings
		const class_id = this.state.selected_class_id

		let modified_settings: MISSettings

		if (settings && settings.classes) {
			modified_settings = {
				...settings,
				classes: {
					...settings.classes,
					defaultFee: {
						...settings.classes.defaultFee,
						[class_id]: {
							...this.state.fee,
							name: this.state.fee.name.trim(),
							amount: Math.abs(amount).toString()
						}
					}
				}
			}
		} else {
			modified_settings = {
				...settings,
				classes: {
					defaultFee: {
						[class_id]: {
							...this.state.fee,
							name: this.state.fee.name.trim(),
							amount: Math.abs(amount).toString() // fee must be absolute value
						}
					}
				}
			}
		}

		this.setState({
			banner: {
				active: true,
				good: true,
				text: "Default Fee has been saved!"
			}
		})

		// updating MISSettings
		this.props.mergeSettings(modified_settings)

		setTimeout(() => this.setState({ banner: { active: false } }), 3000)

	}

	render() {
		const { classes } = this.props

		const disabled = this.isDisabled()

		return <div className="class-settings">
			{this.state.banner.active ? <Banner isGood={this.state.banner.good} text={this.state.banner.text} /> : false}
			<div className="divider">Default Fee</div>
			<div className="section form default-fee">
				<div className="row">
					<label>Class</label>
					<select {...this.former.super_handle(["selected_class_id"], () => true, () => this.onSectionChange())}>
						<option value="">Select Class</option>
						{
							Object.values(classes)
								.sort((a, b) => a.classYear - b.classYear)
								.map((mis_class: MISClass) =>
									<option key={mis_class.id} value={mis_class.id}>
										{mis_class.name}
									</option>)
						}
					</select>
				</div>
			</div>
			<div className="section form default-fee">
				<div className="row">
					<label>Type</label>
					<input type="text" disabled value={this.state.fee.type} />
				</div>
				<div className="row">
					<label>Name</label>
					<input type="text" {...this.former.super_handle(["fee", "name"])} placeholder="Enter Name" />
				</div>
				<div className="row">
					<label>Amount</label>
					<input type="number" {...this.former.super_handle(["fee", "amount"])} placeholder="Enter Amount" />
				</div>
				<div className="row">
					<label>Fee Period</label>
					<input type="text" disabled value={this.state.fee.period} />
				</div>

				<div className="note-message"><span>Note:</span> This is default class fee (MONTHLY) which will be added to every newly created student</div>

				<div className={`button blue ${disabled ? 'disabled' : ''}`} onClick={this.onSaveDefaultFee}>Set Default Fee </div>
			</div>
		</div>
	}
}
export default connect((state: RootReducerState) => ({
	classes: state.db.classes,
	settings: state.db.settings
}), (dispatch: Function) => ({
	mergeSettings: (settings: RootDBState["settings"]) => dispatch(mergeSettings(settings)),
}))(DefaultFeeSettings)