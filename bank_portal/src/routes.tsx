import * as React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Store } from 'redux'

import AuthedRoute from './components/AuthedRoute'

import Login from './components/Login'
import Burger from './pages/Burger'

import './components/Layout/style.css'

export default ({ store } : { store: Store }) => (
	<Provider store={store}>
		<BrowserRouter>
			<Switch>
				<Route path="/login" component={Login} />
				<AuthedRoute path="/" component={Burger} />
			</Switch>
		</BrowserRouter>
	</Provider>
)