import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'

const AuthedRoute = ({ component, school_id, name, token, ...rest }) => {

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

export default connect(state => state.auth)(AuthedRoute);
