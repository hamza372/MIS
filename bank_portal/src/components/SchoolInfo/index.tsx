import React from 'react'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { getSchoolProfiles, reserveMaskedNumber, releaseMaskedNumber, rejectSchool } from '~/src/actions'

import './style.css'

interface OwnProps {
	school_id: string
}

interface StateProps {
	school?: CERPSchool
	schoolMatch?: SchoolMatch
}

interface DispatchProps {
	addSchool: () => void
	releaseNumber: () => void
	reserveNumber: () => void
	rejectSchool: () => void
}

type propTypes = OwnProps & StateProps & DispatchProps & RouteComponentProps

class SchoolInfo extends React.Component<propTypes> {

	constructor(props : propTypes) {
		super(props);

		if(props.school === undefined) {
			props.addSchool()
		}

	}

	componentWillReceiveProps(nextProps : propTypes) {

		if(nextProps.school === undefined && nextProps.school_id !== this.props.school_id) {
			nextProps.addSchool()
		}
	}

	onShowNumber = () => {
		console.log('show da number')

		// should mark as in progress and have a matching number
		// we should be checking this in props to see what button to show
		// i.e. show number or "mark done"

		this.props.reserveNumber()
	}

	onMarkComplete = () => {
		console.log('mark as complete')

		const res = confirm('Are you sure you want to Mark as Complete? Tell us why')

		if(res) {
			this.props.releaseNumber()
		}
	}

	onMarkRejected = () => {
		console.log('mark as reject')

		this.props.rejectSchool()
	}

	onClose = () => {
		this.props.history.push({
			pathname: this.props.location.pathname,
			search: ''
		})
	}

	render() {

		const school = this.props.school;
		if(school === undefined) {
			return <div className="loading">Loading School Info...</div>
		}

		const reserved = this.props.schoolMatch && this.props.schoolMatch.status === "IN_PROGRESS"

		console.log(this.props.match)

		return <div className="school-info page" style={{ padding: "5px" }}>

			<div className="close" onClick={this.onClose}>Close</div>

			<div className="title" style={{ marginTop: 0, textAlign: "center" }}>{school.school_name}</div>

			{ reserved ? 
				<div className="button purple" onClick={this.onMarkComplete}>Mark as Complete</div> :
				<div className="button green" onClick={this.onShowNumber}>Show Number</div>
			}



			<div className="form" style={{width: "90%"}}>
				<div className="row">
					<label>Status</label>
					<div>{this.props.schoolMatch.status}</div>
				</div>
				{ 
					reserved && 
					<div className="row">
						<label>Phone Number</label>
						<a href={`tel:${this.props.schoolMatch.masked_number}`} className="number">{this.props.schoolMatch.masked_number}</a> 
					</div>
				}
				<div className="row">
					<label>Lowest Fee</label>
					<div>{school.lowest_fee} Rs</div>
				</div>
				<div className="row">
					<label>Highest Fee</label>
					<div>{school.highest_fee} Rs</div>
				</div>
				<div className="row">
					<label>Monthly Fee</label>
					<div>{school.monthly_fee_collected} Rs</div>
				</div>
				<div className="row">
					<label>Enrollment</label>
					<div>{school.total_enrolment}</div>
				</div>
				<div className="row">
					<label>Estimated Monthly Revenue</label>
					<div>{(parseInt(school.lowest_fee) + parseInt(school.highest_fee))/2 * parseInt(school.total_enrolment)} Rs</div>
				</div>
				<div className="row">
					<label>Lowest Grade</label>
					<div>{school.lowest_grade}</div>
				</div>
				<div className="row">
					<label>Highest Grade</label>
					<div>{school.highest_grade}</div>
				</div>
				<div className="row">
					<label>Number of Rooms</label>
					<div>{school.no_of_rooms}</div>
				</div>
				<div className="row">
					<label>Financing Interest</label>
					<div>{school.financing_interest}</div>
				</div>
				<div className="row">
					<label>Textbook Interest</label>
					<div>{school.textbook_provider_interest}</div>
				</div>
				<div className="row">
					<label>District</label>
					<div>{school.school_district_confirm}</div>
				</div>
				<div className="row">
					<label>Address</label>
					<div>{school.school_address}</div>
				</div>
				{ reserved ? false : 
					<div className="row">
						<div className="red button" onClick={this.onMarkRejected}>Not Interested</div>
					</div>
				}
			</div>
		</div>
	}
}

// in the future this page should show if a call is in progress
// and when it ends
// and when it ends we ask questions via modal

export default connect<StateProps, DispatchProps, OwnProps>((state : RootBankState, props: OwnProps) => ({
	school: state.new_school_db[props.school_id],
	schoolMatch: state.sync_state.matches[props.school_id]
}), (dispatch : Function, props: OwnProps ) => ({
	addSchool: () => dispatch(getSchoolProfiles([props.school_id])),
	reserveNumber: () => dispatch(reserveMaskedNumber(props.school_id)),
	releaseNumber: () => dispatch(releaseMaskedNumber(props.school_id)),
	rejectSchool: () => dispatch(rejectSchool(props.school_id))
}))(withRouter(SchoolInfo))
