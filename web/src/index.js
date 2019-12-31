import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

import 'core-js/features/object'

import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import reducer from './reducers'

import Routes from './routes'
import { saveDb, initState } from './utils/indexedDb'
import { loadDB, connected, disconnected } from './actions/core'
import Syncr from '@cerp/syncr'

//const debug_host = 'wss://7e01bc49.ngrok.io';
const debug_host = 'wss://mis-socket.metal.fish';

const host = window.api_url || debug_host;

const initialState = initState // loadDB();

const syncr = new Syncr(`${host}/ws`)
syncr.on('connect', () => store.dispatch(connected()))
syncr.on('disconnect', () => store.dispatch(disconnected()))
syncr.on('message', (msg) => store.dispatch(msg))

syncr.message_timeout = 90000;

const store = createStore(reducer, initialState, applyMiddleware(thunkMiddleware.withExtraArgument(syncr)));

store.dispatch(loadDB())

store.subscribe(() => {
	const state = store.getState();
	saveDb(state);
})

ReactDOM.render(<Routes store={store} />, document.getElementById('root'));
registerServiceWorker();
