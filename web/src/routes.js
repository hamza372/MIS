import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Provider } from 'react-redux'

import Landing from 'modules/Landing'
import TeacherList from 'modules/Teacher/List'

export default ({ store }) => (
	<Provider store={store}>
		<BrowserRouter>
			<Switch>
				<Route exact path="/" component={Landing} />
				<Route path="/teacher" component={TeacherList} />
			</Switch>
		</BrowserRouter>
	</Provider>
)
