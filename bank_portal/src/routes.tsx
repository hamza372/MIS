import * as React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Store } from 'redux'

import Home from './components/Home'
import Login from './components/Login'

import './components/Layout/style.css'

export default ({ store } : { store: Store }) => (
	<Provider store={store}>
		<BrowserRouter>
			<Switch>
				<Route path="/school/:school_id" component={Home} />
				<Route path="/login" component={Login} />
				<Route path="/" component={Home} />
			</Switch>
		</BrowserRouter>
	</Provider>
)