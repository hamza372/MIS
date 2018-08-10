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

const store = createStore(reducer, applyMiddleware(thunkMiddleware));
const syncr = new Syncr(`ws://localhost:8080/ws?school_id=${store.getState().school_id}&client_id=${store.getState().client_id}`, (msg) => {
	store.dispatch(msg);
})

store.subscribe(() => {
	const state = store.getState();
	saveDB(state)

	syncr.send(JSON.stringify({
		type: "SYNC",
		school_id: state.school_id,
		payload: state.queued
	}))
})

ReactDOM.render(<Routes store={store} />, document.getElementById('root'));
registerServiceWorker();
