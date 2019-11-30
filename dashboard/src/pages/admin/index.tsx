import React, { Component } from 'react'
import { connect } from 'react-redux'
import { schoolInfo, updateSchoolInfo } from 'actions'
import { RouteComponentProps } from 'react-router'
import Former from 'former'
import { hash } from 'utils'
import moment from 'moment'
import { getEndPointResourceTrial } from 'utils/getEndPointResource'


interface P {
	schoolList: string[]
	schoolInfo: () => any
	updateSchoolInfo: (school_id: string, student_limit: number, paid: boolean, date: number) => any
}

interface S {
	selectedSchool: string
	purchasePassword: string
	resetPassword: string
	misPackage: "" | "TALEEM1" | "TALEEM2" | "UNLIMITED"
	trial_period: number
	paid: string
	date: number
	student_limit: number
	updateMenu: boolean
}

interface routeInfo {

}

interface ServerResp {
	trial_info: {
		trial_period: number
		paid: boolean
		date: number
	}
	student_info: {
		max_limit: number
	}
}

type propTypes = RouteComponentProps<routeInfo> & P

class AdminActions extends Component<propTypes, S> {

	former: Former
	constructor(props: propTypes) {
		super(props)

		this.state = {
			selectedSchool: "",
			purchasePassword: "123",
			resetPassword: "456",
			misPackage: "",
			trial_period: 0,
			paid: "",
			date: 0,
			student_limit: 0,
			updateMenu: false
		}

		this.former = new Former(this, [])
	}

	getLimitFromPackage = (package_name: string) => {
		switch (package_name) {
			case "TALEEM1":
				return 150
			case "TALEEM2":
				return 300
			default:
				return -1
		}
	}

	getPackageFromLimit = (limit: number) => {
		switch (limit) {
			case 150:
				return "TALEEM1"
			case 300:
				return "TALEEM2"
			case -1:
				return "UNLIMITED"
			default:
				return ""
		}
	}

	componentDidMount() {
		this.props.schoolInfo()
	}

	getCodes = async () => {

		const { selectedSchool } = this.state

		const resetPassword = await hash(`reset-${selectedSchool}-${moment().format("MMDDYYYY")}`)
			.then(res => res.substr(0, 4).toLowerCase())

		const purchasePassword = await hash(`buy-${selectedSchool}-${moment().format("MMDDYYYY")}`)
			.then(res => res.substr(0, 4).toLowerCase())

		this.setState({
			resetPassword,
			purchasePassword
		})
	}

	getSetStuff = () => {
		this.getCodes()

		getEndPointResourceTrial("school_info", this.state.selectedSchool)
			.then(res => res.json())
			.then((res: ServerResp) => {
				this.setState({
					trial_period: res.trial_info.trial_period,
					paid: res.trial_info.paid ? "true" : "false",
					date: res.trial_info.date,
					student_limit: res.student_info.max_limit,
					misPackage: this.getPackageFromLimit(res.student_info.max_limit)
				})
			})
			.catch(err => {
				console.error(err)
			})
	}

	onSave = () => {

		const { selectedSchool, misPackage, paid, date } = this.state

		if (misPackage === "" || paid === "" || !date) {
			window.alert("INVALID SELECTION")
			return
		}

		this.props.updateSchoolInfo(selectedSchool, this.getLimitFromPackage(misPackage), paid === "true" ? true : false, date)
	}

	render() {

		const { schoolList } = this.props
		const { selectedSchool, resetPassword, purchasePassword } = this.state

		return <div className="page admin-actions">
			<div className="title"> Admin Actions</div>

			<div className="section form" style={{ width: "75%" }}>
				<div className="divider">Reset/Purchase Code</div>
				<div className="row">
					<label>Select School</label>
					<datalist id="schools">
						{
							schoolList.map(s => <option value={s} key={s}>{s}</option>)
						}
					</datalist>
					<input list="schools" {...this.former.super_handle(["selectedSchool"], () => true, () => this.getSetStuff())} />
				</div>
			</div>

			{selectedSchool && <div className="section form" style={{ width: "75%" }}>
				<div className="divider">School Info</div>
				<div className="row">
					<label>Trial Start Date</label>
					<div>{this.state.date !== -1 ? moment(this.state.date).format("MM-DD-YYYY") : "Not Set"}</div>
				</div>
				<div className="row">
					<label>Status</label>
					<div>{this.state.paid === "true" ? "PAID Customer" : "Trial User"}</div>
				</div>
				<div className="row">
					<label>Student Limit</label>
					<div>{this.state.student_limit === -1 ? "Unlimited" : this.state.student_limit}</div>
				</div>
				<div className="row">
					<label>Trial Period</label>
					<div>{this.state.trial_period} Days</div>
				</div>
				<div className="divider"> Codes </div>
				<div className="row">
					<label>Reset Code:</label>
					<div>{resetPassword}</div>
				</div>
				<div className="row">
					<label>Purchase Code:</label>
					<div> {purchasePassword} </div>
				</div>
				{selectedSchool && !this.state.updateMenu && <div className="button blue" onClick={() => this.setState({ updateMenu: !this.state.updateMenu })}>Update</div>}
			</div>}
			{selectedSchool && this.state.updateMenu && <div className="section form" style={{ width: "75%" }}>
				<div className="button red" onClick={() => this.setState({ updateMenu: !this.state.updateMenu })}>Cancel Update</div>
				<div className="divider">Update Info</div>
				<div className="row">
					<label>Status</label>
					<select {...this.former.super_handle(["paid"])}>
						<option value="">Not Set</option>
						<option value="true">Paid</option>
						<option value="false">Not Paid</option>
					</select>
				</div>
				<div className="row">
					<label>Package</label>
					<select {...this.former.super_handle(["misPackage"])}>
						<option value="">Not Set</option>
						<option value="TALEEM1">Taleem 1</option>
						<option value="TALEEM2">Taleem 2</option>
						<option value="UNLIMITED">Taleem 3</option>
					</select>
				</div>
				<div className="row">
					<label>Trial Start Date</label>
					<input type="date" onChange={this.former.handle(["date"])} value={moment(this.state.date).format("YYYY-MM-DD")} />
				</div>
				<div className="button save" onClick={() => this.onSave()}> Save </div>
			</div>}
		</div>
	}
}
export default connect((state: RootReducerState) => ({
	schoolList: state.school_Info.school_list
}), (dispatch: Function) => ({
	schoolInfo: () => dispatch(schoolInfo()),
	updateSchoolInfo: (school_id: string, student_limit: number, paid: boolean, date: number) => dispatch(updateSchoolInfo(school_id, student_limit, paid, date))
}))(AdminActions)