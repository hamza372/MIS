import React, { Component } from 'react'
import { updateReferralInformation, getReferralsInfo } from 'actions/index'
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import Former from 'former';

import './style.css'
import moment from 'moment';

interface P {
	trials: RootReducerState["trials"]
	getReferralsInfo: () => any
	updateReferralInformation: (school_id: string, value: any) => any
}

const defaultReferralState = () => ({
	agent_easypaisa_number: "",
	agent_name: "",
	area_manager_name: "",
	association_name: "",
	city: "",
	notes: "",
	office: "",
	owner_easypaisa_number: "",
	owner_name: "",
	package_name: "",
	school_name: "",
	type_of_login: "",
	owner_phone: "",
	ref_code: "",
	payment_received: false,
	backcheck_status: "",
	warning_status: "",
	follow_up_status: "",
	trial_reset_status: "",
	overall_status: ""
})

type EditsRow = TrialsDataRow["value"] & {
	time: number
}

interface S {
	edits: {
		[id: string]: EditsRow
	}
	filters: {
		status: string
		daysPassed: string
		filterText: string
	},
	filterMenu: boolean
	active_school: string
}

interface Routeinfo {
	id: string
}

type propTypes = RouteComponentProps<Routeinfo> & P


class Trial extends Component<propTypes, S> {

	former: Former
	constructor(props: propTypes) {
		super(props)

		this.state = {
			edits: {},
			filters: {
				status: "ALL",
				daysPassed: "",
				filterText: ""
			},
			filterMenu: false,
			active_school: ""
		}

		this.former = new Former(this, [])
	}

	componentDidMount() {
		this.props.getReferralsInfo()
	}

	markPaid = (id: string) => {

		this.setState({
			edits: {
				...this.state.edits,
				[id]: {
					...this.state.edits[id],
					payment_received: true
				}
			}
		})
	}

	componentWillReceiveProps(newProps: propTypes) {

		const edits = newProps.trials.reduce((agg, { school_id, time, value }) => {
			return {
				...agg,
				[school_id]: {
					...defaultReferralState(),
					...value,
					time
				}
			}
		}, {})

		this.setState({
			edits
		})
	}

	daysPassed = (date: number) => moment().diff(date, "days")

	getStatus = (date: number) => {

		const daysPassed = this.daysPassed(date)
		if (daysPassed > 15) {
			return `ENDED (${daysPassed - 15 === 0 ? "" : daysPassed - 15})`
		}
		else if (15 - daysPassed === 0) {
			return "Last Day"
		}
		else {
			return `${15 - daysPassed} left`
		}
	}

	onSave = (school_id: string) => {

		const { time, ...value } = this.state.edits[school_id]

		this.props.updateReferralInformation(school_id, value)

	}
	getSearchString = (school_id: string, value: EditsRow) => {
		return `${school_id}${value.notes}${value.area_manager_name}${value.agent_name}${value.owner_phone}${value.city + value.office}${this.daysPassed(value.time) > 15 ? "ENDED-" + (this.daysPassed(value.time) - 15) : "NOT-ENDED"}${value.payment_received ? "paid": ""}`.toLowerCase()
	}

	getStatusFilter = (time: number, paid: boolean) => {
		const daysPassed = this.daysPassed(time)
		const status = this.state.filters.status
		if (status === "ENDED") {
			return daysPassed > 15
		}
		else if (status === "NOT_ENDED") {
			return daysPassed <= 15
		}
		else if (status === "PAID") {
			return paid 
		}
		else if (status === "NOT_PAID") {
			return !paid
		}
		else {
			return true
		}
	}
	getDaysPassedFliter = (time: number) => {
		const item = this.state.filters.daysPassed ? this.state.filters.daysPassed.split("-") : []
		const days = this.daysPassed(time)

		if (item[1] !== undefined) {
			if (parseInt(item[0]) > parseInt(item[1])) {
				return days <= parseInt(item[0]) && days >= parseInt(item[1])
			}
			else if (parseInt(item[1]) > parseInt(item[0])) {
				return days <= parseInt(item[1]) && days >= parseInt(item[0])
			}
			else {
				return days === parseInt(item[0])
			}
		}
		else if (item[0] !== undefined) {
			return days === parseInt(item[0])
		}
		else {
			return true
		}
	}

	setActive = (school_id: string) => {
		const active_school = this.state.active_school === school_id ? "" : school_id

		this.setState({
			active_school
		})
	}

	render() {
		const { edits, filterMenu,active_school } = this.state

		const Items = Object.entries(edits)
			.filter(([school_id, value]) => {
				return this.getStatusFilter(value.time, value.payment_received)
					&& this.getDaysPassedFliter(value.time)
					&& this.getSearchString(school_id, value).includes(this.state.filters.filterText.toLowerCase())
			})
			.sort(([, a_value], [, b_value]) => this.daysPassed(a_value.time) - this.daysPassed(b_value.time))

		return <div className="trials page">

			<div className="title"> Trial Information</div>

			<div className="form" style={{ width: "90%", marginBottom: "20px" }}>
				
				<div className={!filterMenu ? "button blue" : "button red"} onClick={() => this.setState({ filterMenu: !filterMenu })}>{!filterMenu ? "Filters" : "Close"}</div>
				{filterMenu && <>
					<div className="row">
						<label>Total</label>
						<div style={{ fontWeight: "bold", color: "grey", fontSize: "2em" }}>{Items.length}</div>
					</div>
					<div className="row">
						<label>Status</label>
						<select {...this.former.super_handle(["filters", "status"])}>
							<option value="ALL"> ALL</option>
							<option value="ENDED">Ended</option>
							<option value="NOT_ENDED">Not Ended</option>
							<option value="PAID"> Paid</option>
							<option value="NOT_PAID"> Not Paid</option>
						</select>
					</div>
					<div className="row">
						<label>Days Passed since Login</label>
						<input type="text" {...this.former.super_handle(["filters", "daysPassed"])} placeholder="Day-Day" />
					</div>
					<input type="text" {...this.former.super_handle(["filters", "filterText"])} placeholder="Search" style={{ width: "100%" }} />
				</>}
			</div>

			<div className="section" style={{ overflow: "auto" }}>
				<div className="newtable">
					<div className="newtable-row heading">
						<div>School Name</div>
						<div>Area/City</div>
						<div>Status</div>
					</div>

					{
						Items
							.map(([school_id, value], index) => {
								return <div key={school_id}>
									<div className="newtable-row">
										<div className="clickable" onClick={() => this.setActive(school_id)}>{school_id}</div>
										<div>{value.city}</div>
										{
											!value.payment_received ? <div> {this.getStatus(value.time)}</div> : <div> Paid </div>
										}
									</div>
									{
										this.state.active_school === school_id && <div className="more">
											<div className="form">
											<div className="row">
													<label>Owner Name</label>
													<input type="text" className="newtable-input" {...this.former.super_handle(["edits", school_id, "owner_name"])} />
												</div>
												<div className="row">
													<label>Owner Phone</label>
													<input type="text" className="newtable-input" {...this.former.super_handle(["edits", school_id, "owner_phone"])} />
												</div>
												<div className="row">
													<label>Area Manager</label>
													<div>{value.area_manager_name || "-"}</div>
												</div>
												<div className="row">
													<label>Agent name</label>
													<div>{value.agent_name || "-"}</div>
												</div>
												<div className="row">
													<label>Notes</label>
													<input type="text" className="newtable-input" {...this.former.super_handle(["edits", school_id, "notes"])} />
												</div>
												<div className="row">
													<label>Ref-Code</label>
													<input type="text" className="newtable-input" {...this.former.super_handle(["edits", school_id, "ref_code"])} />
												</div>
												<div className="row">
													<label>BackCheck Status</label>
													<input type="text" className="newtable-input" {...this.former.super_handle(["edits", school_id, "backcheck_status"])} />
												</div>
												<div className="row">
													<label>Warning Status</label>
													<input type="text" className="newtable-input" {...this.former.super_handle(["edits", school_id, "warning_status"])} />
												</div>
												<div className="row">
													<label>Followup Status</label>
													<input type="text" className="newtable-input" {...this.former.super_handle(["edits", school_id, "follow_up_status"])} />
												</div>
												<div className="row">
													<label>Trial Reset Status</label>
													<input type="text" className="newtable-input" {...this.former.super_handle(["edits", school_id, "trial_reset_status"])} />
												</div>
												<div className="row">
													<label>Overall Status</label>
													<input type="text" className="newtable-input" {...this.former.super_handle(["edits", school_id, "overall_status"])} />
												</div>
												{
													!value.payment_received && <div className="row">
														<label>Mark Paid</label>
														<div className="button blue" onClick={() => this.markPaid(school_id)}>Mark</div>
													</div>
												}
												<div className="button save" style={{ marginTop: "20px" }} onClick={() => this.onSave(school_id)}> Save </div>
											</div>
										</div>
									}
								</div>
							})
					}
				</div>
			</div>

		</div>
	}
}

export default connect((state: RootReducerState) => ({
	trials: state.trials
}), (dispatch: Function) => ({
	updateReferralInformation: (school_id: string, value: any) => dispatch(updateReferralInformation(school_id, value)),
	getReferralsInfo: () => dispatch(getReferralsInfo())
}))(Trial)