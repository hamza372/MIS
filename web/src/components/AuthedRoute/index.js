import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'

const AuthedRoute = ({ component, school_id, name, token, initialized, ...rest }) => {

	if (!initialized) {
		console.log("THIS IS NOT INITIALIZED")
		return <div>Loading Database....</div>
	}

	if(token && name) {
		return <Route component={component} {...rest} />
	}
	else if(token) {
		return <Redirect to="/login" />
	}
	else {
		return <Redirect to="/school-login" />
	}

}

export default connect(state => ({ ...state.auth, initialized: state.initialized }))(AuthedRoute);