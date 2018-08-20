import React from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'

const AuthedRoute = ({ component: Component, username, ...rest }) => {

	if(username) {
		console.log('logged in!')
		return <Component {...rest} />
	}
	else {
		return <Redirect to="/login" />
	}

}

export default connect(state => state.auth)(AuthedRoute);
