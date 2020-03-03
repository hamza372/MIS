import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getSchoolList, resetSchoolPassword } from 'actions'
import Former from 'former'

interface P {
	getSchoolList: () => void
	schoolList: string[]
	resetSchoolPassword: (school_id: string, password: string) => void
}

interface S {
	school_id: string
	password: string
}

class ResetPassword extends Component<P, S> {

	former: Former
	constructor(props: P) {
		super(props)

		this.state = {
			school_id: "",
			password: ""
		}

		this.former = new Former(this, [])
	}

	onRestPassword = () => {
		const { school_id, password } = this.state
		this.props.resetSchoolPassword(school_id, password)
	}

	componentDidMount() {
		this.props.getSchoolList()
	}

	render() {

		const { schoolList } = this.props

		return <div className="page admin-actions">
			<div className="title"> Reset School Password</div>
			<div className="section form" style={{ width: "75%" }}>
				<div className="row">
					<label>Select School</label>
					<datalist id="schools">
						{
							schoolList.map(s => <option value={s} key={s}>{s}</option>)
						}
					</datalist>
					<input list="schools" {...this.former.super_handle(["school_id"])} placeholder="Type or Select School" />
				</div>
				<div className="row">
					<label>Password</label>
					<input type="text" {...this.former.super_handle(["password"])} placeholder="Enter Password" />
				</div>
				<div className="button blue" onClick={this.onRestPassword}>Reset Password</div>
			</div>
		</div>
	}
}

export default connect((state: RootReducerState) => ({
	schoolList: state.school_Info.school_list,
}), (dispatch: Function) => ({
	getSchoolList: () => dispatch(getSchoolList()),
	resetSchoolPassword: (school_id: string, password: string) => dispatch(resetSchoolPassword(school_id, password))
}))(ResetPassword)