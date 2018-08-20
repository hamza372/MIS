import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import reducer from './reducers'

import Routes from './routes'
import { saveDB } from 'utils/localStorage';
import Syncr from 'syncr'
import syncrware from 'syncr/middleware'

const store = createStore(reducer, applyMiddleware(thunkMiddleware, syncrware({ getSyncr: () => syncr })));
const host = '192.168.0.237'
const syncr = new Syncr(`ws://${host}:8080/ws`, {school_id: store.getState().school_id, client_id: store.getState().client_id}, (msg) => {
	store.dispatch(msg);
})

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
