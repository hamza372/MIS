import * as React  from "react"
import * as ReactDOM from "react-dom"
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware, { ThunkMiddleware } from 'redux-thunk'
import { Actions } from './actions'

import Syncr from './syncr'
import reducer from './reducers'

const debug_url = "ws://localhost:8080/ws"

import Routes from './routes'

const syncr : Syncr = new Syncr(debug_url, msg => store.dispatch(msg))
const store = createStore(reducer, applyMiddleware(thunkMiddleware.withExtraArgument(syncr) as ThunkMiddleware<RootBankState, Actions, Syncr>));

ReactDOM.render(
	<Routes store={store} />,
	document.getElementById("root")
)