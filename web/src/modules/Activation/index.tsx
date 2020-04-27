import React, { Component } from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps, Redirect } from 'react-router-dom'
import moment from 'moment'
import { hash } from 'utils'

import { resetTrial, markPurchased } from 'actions'

import Layout from 'components/Layout'
import Former from 'utils/former'
import { ExclamationIcon, HappyEmojiIcon } from 'assets/icons'

import './style.css'


interface P {
	initialized: boolean
	school_id: string
	package_info: MISPackage

	resetTrial: () => void
	markAsPurchased: () => void
}

interface S {
	code: string
	isVerified: boolean
	invalidCode: boolean
}

type PropsType = P & RouteComponentProps

class MISActivation extends Component<PropsType, S> {
	former: Former
	constructor(props: PropsType) {
		super(props)

		this.state = {
			code: "",
			invalidCode: false,
			isVerified: false
		}

		this.former = new Former(this, [])
	}

	verifyCode = async (code: string) => {

		const { school_id } = this.props

		const reset_code = await hash(`reset-${school_id}-${moment().format("MMDDYYYY")}`)
			.then(res => res.substr(0, 4).toLowerCase())

		const purchase_code = await hash(`buy-${school_id}-${moment().format("MMDDYYYY")}`)
			.then(res => res.substr(0, 4).toLowerCase())

		if (code === reset_code) {
			this.props.resetTrial()
			return true
		}

		if (code === purchase_code) {
			this.props.markAsPurchased()
			return true
		}

		return false
	}

	onVerifyCode = () => {

		const { code } = this.state

		if (code.trim().length === 0) {
			return
		}

		this.verifyCode(code)
			.then(accepted => {
				if (accepted) {
					this.setState({
						isVerified: true
					})
				} else {
					this.setState({
						invalidCode: true
					})
				}
			})

		// don't show error message after 3s
		setTimeout(() => {
			this.setState({
				invalidCode: false
			})
		}, 3000)
	}

	render() {

		const { isVerified, invalidCode } = this.state

		const { school_id, initialized } = this.props

		console.log(isVerified)

		return <>
			{
				!(school_id && initialized) && <Redirect to="/school-login" />
			}
			<Layout history={this.props.history}>
				<div className="mis-activation">
					<div className="section-container">
						<div className="title">Verify Activation Code</div>
						{!isVerified &&
							<div className="section">
								<div className="trial-alert">
									<div className="exclamation-icon">
										<img src={ExclamationIcon} alt="exclamation" />
									</div>
									<div className="trial-text is-danger">Trial has been ended. Please enter <strong>reset trial</strong> or <strong>purchase</strong> code to use MISchool</div>
								</div>
								<div className="activation-code">
									<div className="row">
										<input type="text" {...this.former.super_handle(["code"])} placeholder="Enter valid code" autoFocus />
									</div>
									{invalidCode &&
										<div className="row is-danger" style={{ marginTop: 10 }}>Invalid code, please enter valid code</div>
									}
									<div className="" style={{ marginTop: 10 }}>
										<button className="button blue" onClick={this.onVerifyCode}>Verify Code</button>
									</div>
								</div>
							</div>
						}
						{isVerified &&
							<div className="section">
								<div className="trial-alert">
									<div className="exclamation-icon">
										<img src={HappyEmojiIcon} alt="exclamation" />
									</div>
									<div className="trial-text is-success">Hurrah! Code has been verified</div>
								</div>
							</div>
						}
					</div>
				</div>
			</Layout>
		</>
	}
}

export default connect((state: RootReducerState) => ({
	initialized: state.initialized,
	school_id: state.auth.school_id,
	package_info: state.db.package_info || { date: -1, trial_period: 15, paid: false },
}), (dispatch: Function) => ({
	resetTrial: () => dispatch(resetTrial()),
	markAsPurchased: () => dispatch(markPurchased())
}))(MISActivation)