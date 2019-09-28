import React, { Component } from 'react'
import { createSchoolLogin } from '../../actions/index'
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import Former from 'former';
import checkCompulsoryFields from '../../utils/checkCompulsoryFields';

import './style.css'
import moment from 'moment';

interface P {
	createSchoolLogin: (username: string, password: string, limit: number, value: SignUpValue) => any
}

interface DataRow {
	school_id: string
	time: number
	value: {
		agent_easypaisa_number: string
		agent_name: string
		area_manager_name: string
		association_name: string
		city: string
		notes: string
		office: string
		owner_easypaisa_number: string
		owner_name: string
		package_name: string
		school_name: string
		type_of_login: string
	}
}

interface S {
	data: DataRow[]
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
			data: []
		}
	
		this.former = new Former(this, [])
	}

	componentDidMount() {

		const headers = new Headers();

		// @ts-ignore

		//Need to update basdhsakjdsakjdkjsahdjksa sadhjakjfkjda ashjasfkjafa ashfjahfjak akfjahfkjasfja sahfsajfhsakjhfsaj

		headers.set('Authorization', 'Basic ' + btoa(`${window.username}:${window.password}`))
	
		fetch('https://mis-socket.metal.fish/dashboard/referrals', {
			headers
		})
			.then(resp => resp.json())
			.then(resp => {
				this.setState({
					data: resp.referrals
				})
			})
			.catch(res => {
				window.alert("Error Fetching Trial Information!")
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

	render() {

		console.log("DATA", this.state.data)

		const { data } = this.state

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
							<div>Notes</div>
						</div>
						
						{
							data
								.map(r => {
									return <div key={r.school_id} className="newtable-row">
										<div>{r.school_id}</div>
										<div>{r.value.city}</div>
										<div>{this.getStatus(r.time)}</div>
										<div>{r.value.area_manager_name || "-"}</div>
										<div>{r.value.agent_name || "-"}</div>
										<div>{r.value.notes}</div>
									</div>
								})
						}
					</div>
				</div>
				
		</div>
	}
}

export default connect( state => ({}), ( dispatch: Function ) => ({
	createSchoolLogin: (username: string, password: string, limit: number, value: SignUpValue) => dispatch(createSchoolLogin(username, password, limit, value))
}))(Trial)