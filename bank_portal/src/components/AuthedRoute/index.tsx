import * as React from 'react'
import { Route, Redirect, RouteProps } from 'react-router-dom'
import { connect } from 'react-redux'

interface StateProps {
	auth: RootBankState['auth']
	number_exists: boolean
}

type propTypes = StateProps & RouteProps

const AuthedRoute = ({ component, auth: { id, token, number }, number_exists , ...rest } : propTypes) => {

	if(token && id) {

		if(!number_exists) {
			return <Redirect to="/verify-number" />
		}

		return <Route component={component} {...rest} />
	}

	return <Redirect to="/login" />
}

export default connect<StateProps>((state : RootBankState) => ({
	auth: state.auth,
	number_exists: state.sync_state.numbers[state.auth.number] !== undefined
}))(AuthedRoute);
