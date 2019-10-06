import React, { Component } from 'react'
import { createSchoolLogin, updateReferralInformation, getReferralsInfo } from '../../actions/index'
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import Former from 'former';
import checkCompulsoryFields from '../../utils/checkCompulsoryFields';

import './style.css'
import moment from 'moment';

interface P {
	trials: RootReducerState["trials"]
	getReferralsInfo: () => any
	createSchoolLogin: (username: string, password: string, limit: number, value: SignUpValue) => any
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
	payment_received: false
})

type EditsRow = TrialsDataRow["value"] & {
	time: number
}

interface S {
	edits: {
		[id: string]: EditsRow
	}
}

interface Routeinfo {
	id: string
}

type propTypes = RouteComponentProps<Routeinfo> & P


class Trial extends Component <propTypes, S> {

	former: Former
	constructor(props: propTypes) {
		super(props)

		this.state = {
			edits: {}
		}

		this.former = new Former(this, [])
	}

	componentDidMount() {
		this.props.getReferralsInfo()
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

	getStatus = (date: number) => {
		
		const daysPassed = moment().diff(date, "days")
		if (daysPassed > 15) {
			return "ENDED"
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

	render() {

		const { edits } = this.state

 		return <div className="trials page">

				<div className="title"> Trial Information</div>

				<div className="section">
					<div className="newTable">
						<div className="newtable-row heading">
							<div>School Name</div>
							<div>Area/City</div>
							<div>Status</div>
							<div>Area Manager</div>
							<div>Agent</div>
							<div>Owner Phone</div>
							<div>Notes</div>
							<div>Payment</div>
							<div></div>
						</div>
						
						{
							Object.entries(edits)
								.map(([school_id, value]) => {
									return <div key={school_id} className="newtable-row">
										<div>{school_id}</div>
										<div>{value.city}</div>
										<div>{this.getStatus(value.time)}</div>
										<div>{value.area_manager_name || "-"}</div>
										<div>{value.agent_name || "-"}</div>
										<div>
											<input type="text" className="newtable-input" {...this.former.super_handle(["edits", school_id ,"owner_phone"])}/>
										</div>
										<div>
											<input type="text" className="newtable-input" {...this.former.super_handle(["edits", school_id, "notes"])}/>
										</div>
										<div> 
											{value.payment_received ? "Received": "Due"}
										</div>
										<div style={{ display:"flex", justifyContent:"center"}}>
											<div className="button save" onClick={() => this.onSave(school_id)}> Save </div>
										</div>
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
}), ( dispatch: Function ) => ({
	createSchoolLogin: (username: string, password: string, limit: number, value: SignUpValue) => dispatch(createSchoolLogin(username, password, limit, value)),
	updateReferralInformation: (school_id: string, value: any) => dispatch(updateReferralInformation(school_id, value)),
	getReferralsInfo: () => dispatch(getReferralsInfo())
}))(Trial)