import * as React from 'react'
import { Route, Redirect, RouteProps } from 'react-router-dom'
import { connect } from 'react-redux'

interface StateProps {
	auth: RootReducerState['auth']
}

type propTypes = StateProps & RouteProps

const AuthedRoute = ({ component, auth: { id, token }, ...rest } : propTypes) => {

	if(token && id) {

		return <Route component={component} {...rest} />
	}

	return <Redirect to="/login" />
}

export default connect((state : RootReducerState) => ({
	auth: state.auth
}))(AuthedRoute);
