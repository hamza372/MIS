import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Provider } from 'react-redux'

import Landing from 'modules/Landing'
import TeacherList from 'modules/Teacher/List'
import TeacherSingle from 'modules/Teacher/Single'
import Login from 'modules/Login'

import AuthedRoute from 'components/AuthedRoute'

export default ({ store }) => (
	<Provider store={store}>
		<BrowserRouter>
			<Switch>
				<AuthedRoute exact path="/" component={Landing} />
				<AuthedRoute path="/teacher/:id" component={TeacherSingle} />
				<AuthedRoute path="/teacher" component={TeacherList} />
				<Route path="/login" component={Login} />
			</Switch>
		</BrowserRouter>
	</Provider>
)
