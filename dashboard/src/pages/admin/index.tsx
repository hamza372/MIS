import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getSchoolList, updateSchoolInfo, getSchoolInfo } from 'actions'
import { RouteComponentProps } from 'react-router'
import Former from 'former'
import { hash } from 'utils'
import moment from 'moment'


interface P {
	schoolList: string[]
	trial_info: RootReducerState["school_Info"]["trial_info"]
	student_info: RootReducerState["school_Info"]["student_info"]
	getSchoolList: () => any
	updateSchoolInfo: (school_id: string, student_limit: number, paid: boolean, date: number) => any
	getSchoolInfo: (school_id: string) => any
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
	infoMenu: boolean
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
			updateMenu: false,
			infoMenu: false
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
		this.props.getSchoolList()
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

		this.props.getSchoolInfo(this.state.selectedSchool)

		this.setState({
			infoMenu: true
		})
	}

	onSave = () => {

		const { selectedSchool, misPackage, paid, date } = this.state

		if (misPackage === "" || paid === "" || !date) {
			window.alert("Please Fill All info")
			return
		}

		this.props.updateSchoolInfo(selectedSchool, this.getLimitFromPackage(misPackage), paid === "true" ? true : false, date)
	}

	render() {

		const student_info = this.props.student_info
		const trial_info = this.props.trial_info

		const trial_period = (trial_info && trial_info.trial_period ) || 0
		const paid = trial_info && trial_info.paid ? "true" : "false"
		const date = (trial_info && trial_info.date) || -1
		const student_limit = (student_info && student_info.max_limit) || 0

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
					<input list="schools" {...this.former.super_handle(["selectedSchool"])} />
				</div>
				<div className="button blue" onClick={() => this.getSetStuff()}>LOAD</div>
			</div>

			{this.state.infoMenu && <div className="section form" style={{ width: "75%" }}>
				<div className="divider">School Info</div>
				<div className="row">
					<label>Trial Start Date</label>
					<div>{ date !== -1 ? moment(date).format("MM-DD-YYYY") : "Not Set"}</div>
				</div>
				<div className="row">
					<label>Status</label>
					<div>{paid === "true" ? "PAID Customer" : "Trial User"}</div>
				</div>
				<div className="row">
					<label>Student Limit</label>
					<div>{student_limit === -1 ? "Unlimited" : this.state.student_limit}</div>
				</div>
				<div className="row">
					<label>Trial Period</label>
					<div>{trial_period} Days</div>
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
					<input type="date" onChange={this.former.handle(["date"])} />
				</div>
				<div className="button save" onClick={() => this.onSave()}> Save </div>
			</div>}
		</div>
	}
}
export default connect((state: RootReducerState) => ({
	schoolList: state.school_Info.school_list,
	trial_info: state.school_Info.trial_info,
	student_info: state.school_Info.student_info
}), (dispatch: Function) => ({
	getSchoolList: () => dispatch(getSchoolList()),
	getSchoolInfo: (school_id: string) => dispatch(getSchoolInfo(school_id)),
	updateSchoolInfo: (school_id: string, student_limit: number, paid: boolean, date: number) => dispatch(updateSchoolInfo(school_id, student_limit, paid, date))
}))(AdminActions)