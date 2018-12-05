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

<<<<<<< HEAD
const debug_host = 'wss://fb32146f.ngrok.io'
=======
const debug_host = 'wss://a187439b.ngrok.io'
>>>>>>> a62bf2e4ca07bdbe6a6161b11b0eb8a7225091cb

const host = process.env.REACT_APP_MIS_HOST || debug_host;
const initialState = loadDB();

const syncr = new Syncr(`${host}/ws`, msg => store.dispatch(msg))
const store = createStore(reducer, initialState, applyMiddleware(thunkMiddleware.withExtraArgument(syncr)));

store.subscribe(() => {
	const state = store.getState();
	saveDB(state);
})

ReactDOM.render(<Routes store={store} />, document.getElementById('root'));
registerServiceWorker();
