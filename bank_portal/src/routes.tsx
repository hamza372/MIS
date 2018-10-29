import * as React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Store } from 'redux'

import Home from './components/Home'

export default ({ store } : { store: Store }) => (
	<Provider store={store}>
		<BrowserRouter>
			<Switch>
				<Route path="/" component={Home} />
			</Switch>
		</BrowserRouter>
	</Provider>
)