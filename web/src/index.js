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

const debug_host = 'wss://380ffe7d.ngrok.io'

const host = process.env.REACT_APP_MIS_HOST || debug_host;
const initialState = loadDB();

const syncr = new Syncr(`${host}/ws`, msg => store.dispatch(msg))
const store = createStore(reducer, initialState, applyMiddleware(thunkMiddleware.withExtraArgument(syncr)));

store.subscribe(() => {
	const state = store.getState();
	saveDB(state)
})

ReactDOM.render(<Routes store={store} />, document.getElementById('root'));
registerServiceWorker();
