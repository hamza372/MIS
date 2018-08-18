import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Provider } from 'react-redux'

import Landing from 'modules/Landing'
import TeacherList from 'modules/Teacher/List'
import TeacherSingle from 'modules/Teacher/Single'
import Login from 'modules/Login'

export default ({ store }) => (
	<Provider store={store}>
		<BrowserRouter>
			<Switch>
				<Route exact path="/" component={Landing} />
				<Route path="/teacher/:id" component={TeacherSingle} />
				<Route path="/teacher" component={TeacherList} />
				<Route path="/login" component={Login} />
			</Switch>
		</BrowserRouter>
	</Provider>
)
