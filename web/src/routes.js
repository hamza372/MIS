import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Provider } from 'react-redux'

import App from './pages/App'

export default ({ store }) => (
	<Provider store={store}>
		<BrowserRouter>
			<Route path="/" component={App} />
		</BrowserRouter>
	</Provider>
)
