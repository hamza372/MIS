import * as React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Store } from 'redux'

import InputPage from './pages/input'

export default ({ store } : {store: Store}) => (
	<Provider store={store}>
		<BrowserRouter>
			<Switch>
				<Route exact path="/" component={InputPage} />
			</Switch>
		</BrowserRouter>
	</Provider>
)