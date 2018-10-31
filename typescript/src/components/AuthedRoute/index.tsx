import * as React from 'react'
import { Route, Redirect, RouteProps } from 'react-router-dom'
import { connect } from 'react-redux'

interface AuthProps {
	component: any,
	school: string,
	username: string,
	token: string
}
const AuthedRoute = ({ component, username, token, ...rest } : AuthProps & RouteProps) => {

	console.log(component, username, token, rest)

	if(token && username) {
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
