import React, { useEffect } from 'react'
import { Route, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'

type propsType = {
	component: any	
	school_id: string
	name: string
	token: string
	initialized: boolean
}
 
const AuthedRoute = ({ component, school_id, name, token, initialized, ...rest }: propsType) => {

	// react's hook
	useEffect(() => {
		window.scroll(0, 0)
	})

	if (!initialized) {
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

export default connect((state: RootReducerState) => ({ ...state.auth, initialized: state.initialized }))(AuthedRoute);