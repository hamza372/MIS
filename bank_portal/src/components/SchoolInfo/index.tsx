import React from 'react'
import { connect } from 'react-redux'
import { getSchoolProfiles } from '~/src/actions'

// this will always receive a school_id as a prop

interface propTypes {
	school_id: string,
	school?: CERPSchool,
	addSchool: (school_id : string ) => void
}

class SchoolInfo extends React.Component<propTypes> {

	constructor(props : propTypes) {
		super(props);

		if(props.school === undefined) {
			props.addSchool(props.school_id)
		}
		
	}

	componentWillReceiveProps(nextProps : propTypes) {

		if(nextProps.school === undefined && nextProps.school_id !== this.props.school_id) {
			nextProps.addSchool(nextProps.school_id)
		}
	}

	render() {

		const school = this.props.school;
		if(school === undefined) {
			return <div className="loading">Loading School Info...</div>
		}

		return <div className="school-info page">
			<div className="title">{school.school_name}</div>
		</div>
	}
}

// not sure if i need this at all...
// should the parent always be responsible for loading the content

// in the future this page should show if a call is in progress
// and when it ends
// and when it ends we ask questions via modal

export default connect((state : RootBankState, props: propTypes) => ({
	school: state.new_school_db[props.school_id],
}), (dispatch : Function) => ({
	addSchool: (school_id : string) => dispatch(getSchoolProfiles([school_id]))
}))(SchoolInfo)
