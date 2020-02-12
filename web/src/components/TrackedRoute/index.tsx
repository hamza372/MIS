import React, { useEffect } from 'react'
import { Route, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { trackRoute } from '../../actions'

type propsType = {
	component: any
	school_id: string
	name: string
	token: string
	initialized: boolean
	location: { pathname: string }
	trackRoute: (path: string) => any
}

const TrackedRoute = ({ component, school_id, name, token, initialized, location, trackRoute, ...rest }: propsType) => {

	const Component = component
	// react's hook
	useEffect(() => {
		window.scroll(0, 0);
	})

	if (!initialized) {
		return <div>Loading Database....</div>
	}

	if (token && name) {
		return <Route {...rest} render={(props) => {
			trackRoute(window.location.pathname)
			//@ts-ignore
			return <Component {...props} />
		}} />
	}
	else if (token) {
		trackRoute('/login')
		return <Redirect to="/login" />
	}
	else {
		trackRoute("/school-login")
		return <Redirect to="/school-login" />
	}
}

export default connect((state: RootReducerState) => ({
	...state.auth, initialized: state.initialized
}), (dispatch: Function) => ({
	trackRoute: (path: string) => dispatch(trackRoute(path))
}))(TrackedRoute);