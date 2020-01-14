import * as React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Store } from 'redux'

import Accordian from './components/Accordian';
import Login from 'components/Login';
import AuthedRoute from 'components/AuthedRoute';

export default ({ store } : {store: Store}) => (
	<Provider store={store}>
		<BrowserRouter>
			<Switch>
				<Route exact path="/login" component={Login}/>
				<AuthedRoute path="/" component={Accordian} />
			</Switch>
		</BrowserRouter>
	</Provider>
)