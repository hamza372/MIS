import * as React from 'react'
import { Route, Redirect, RouteProps } from 'react-router-dom'
import { connect } from 'react-redux'

const AuthedRoute = ({ component, id, token, ...rest } : RootBankState['auth'] & RouteProps) => {

	//console.log(component, id, token, rest)

	if(token && id) {
		return <Route component={component} {...rest} />
	}

	return <Redirect to="/login" />
}

export default connect((state : RootBankState) => state.auth)(AuthedRoute);
