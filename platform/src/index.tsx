import * as React  from "react"
import * as ReactDOM from "react-dom"
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware, { ThunkMiddleware } from 'redux-thunk'

import { Actions } from './actions'
import { createMerges, createDeletes } from './actions/core'
import { loadDB, saveDB } from './utils/localStorage'

import Syncr from './syncr'
import reducer from './reducers'

const debug_url = "wss://36feace3.ngrok.io/ws"
//const debug_url = "wss://platform.mischool.pk/ws"

// @ts-ignore
const host = window.api_url || debug_url;

import Routes from './routes'

const initial_state = loadDB();
console.log("initial state", initial_state)
const syncr : Syncr = new Syncr(host, msg => store.dispatch(msg))
const store = createStore(reducer, initial_state, applyMiddleware(thunkMiddleware.withExtraArgument(syncr) as ThunkMiddleware<RootBankState, Actions, Syncr>));

//@ts-ignore
if(window.api_url === undefined) {
	//@ts-ignore
	window.createMerges = createMerges;
	//@ts-ignore
	window.createDeletes = createDeletes;
	//@ts-ignore
	window.dispatch = store.dispatch;
}

store.subscribe(() => {
	const state = store.getState();
	saveDB(state);
})

ReactDOM.render(
	<Routes store={store} />,
	document.getElementById("root")
)