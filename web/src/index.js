import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import reducer from './reducers'

import Routes from './routes'
import { saveDB, loadDB } from 'utils/localStorage';
import Syncr from 'syncr'

const debug_host = 'wss://5d30766a.ngrok.io'
//const debug_host = 'ws://192.168.0.237:8080'
//const debug_host = 'ws://192.168.10.8:8080'
//const debug_host = 'ws://localhost:8080'
//const debug_host = "wss://mis-socket.metal.fish"

const host = process.env.REACT_APP_MIS_HOST || debug_host;
const initialState = loadDB();

const syncr = new Syncr(`${host}/ws`, (msg) => { store.dispatch(msg); }) // is there a better way to dispatch
const store = createStore(reducer, initialState, applyMiddleware(thunkMiddleware.withExtraArgument(syncr)));

// connect syncr to store better. 
// syncr should subscribe to store updates. 
// actions should add to the queued action by default
// syncr subscribes and on each update, will send all edits down

store.subscribe(() => {
	const state = store.getState();
	saveDB(state)
})

ReactDOM.render(<Routes store={store} />, document.getElementById('root'));
registerServiceWorker();
