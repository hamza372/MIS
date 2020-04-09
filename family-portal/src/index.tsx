import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { applyMiddleware, AnyAction, createStore, Store } from 'redux';
import thunkMiddleware, { ThunkMiddleware } from 'redux-thunk'

import Routes from './routes'
import Syncr from '@cerp/syncr'
import reducer from './reducers'

import { loadDB, saveDB } from './utils/localStorage'
import debounce from './utils/debounce';

import { connected, disconnected, processImageQueue } from 'actions/core'


//const debug_url = "c26dc055.ngrok.io"
const debug_url = "localhost:8080"
//@ts-ignore
const host = window.api_url || debug_url;

const initial_state = loadDB()

const syncr = new Syncr(`ws://${host}/ws`)

// @ts-ignore
syncr.on('connect', () => store.dispatch(connected()))
syncr.on('disconnect', () => store.dispatch(disconnected()))
syncr.on('message', (msg: AnyAction) => store.dispatch(msg))
//@ts-ignore
syncr.on('verify', () => store.dispatch(processImageQueue()))


const store: Store<RootReducerState> = createStore(
	reducer,
	initial_state,
	applyMiddleware(thunkMiddleware.withExtraArgument(syncr) as ThunkMiddleware<RootReducerState, AnyAction, Syncr>))

const saveBounce = debounce(() => {
	const state = store.getState();
	saveDB(state)
}, 500);

store.subscribe(saveBounce as () => void)
ReactDOM.render(<Routes store={store} />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register({
	onUpdate: (registration: ServiceWorkerRegistration) => {
		registration.installing?.postMessage({
			type: "SKIP_WAITING"
		})
	}
});