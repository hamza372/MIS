import * as React  from "react"
import * as ReactDOM from "react-dom"
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware, { ThunkMiddleware } from 'redux-thunk'

import { Actions } from './actions'
import { loadDB, saveDB } from './utils/localStorage'

import Syncr from './syncr'
import reducer from './reducers'

const debug_url = "ws://5469bc15.ngrok.io/ws"

// @ts-ignore
const host = window.api_url || debug_url;

import Routes from './routes'

const initial_state = loadDB();
const syncr : Syncr = new Syncr(host, msg => store.dispatch(msg))
const store = createStore(reducer, initial_state, applyMiddleware(thunkMiddleware.withExtraArgument(syncr) as ThunkMiddleware<RootBankState, Actions, Syncr>));

store.subscribe(() => {
	const state = store.getState();
	saveDB(state);
})

ReactDOM.render(
	<Routes store={store} />,
	document.getElementById("root")
)