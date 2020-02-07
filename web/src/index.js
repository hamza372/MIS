import React from 'react';
import ReactDOM from 'react-dom';
import Syncr from '@cerp/syncr'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import 'core-js/features/object'

import registerServiceWorker from './registerServiceWorker';
import reducer from './reducers'
import Routes from './routes'
import { saveDb, initState } from './utils/indexedDb'
import debounce from 'utils/debounce'
import { loadDB, connected, disconnected, processImageQueue } from './actions/core'

import './index.css';

//window.debug_host = '69def37f.ngrok.io';
window.debug_host = 'mis-socket.metal.fish'

const host = window.api_url || window.debug_host;

const initialState = initState // loadDB();

const syncr = new Syncr(`wss://${host}/ws`)
syncr.on('connect', () => store.dispatch(connected()))
syncr.on('disconnect', () => store.dispatch(disconnected()))
syncr.on('message', (msg) => store.dispatch(msg))
syncr.on('verify', () => store.dispatch(processImageQueue()))

syncr.message_timeout = 90000;

const store = createStore(reducer, initialState, applyMiddleware(thunkMiddleware.withExtraArgument(syncr)));

store.dispatch(loadDB())

store.subscribe(debounce(() => {
	const state = store.getState();
	saveDb(state);
}, 1000))

ReactDOM.render(<Routes store={store} />, document.getElementById('root'));
registerServiceWorker();
