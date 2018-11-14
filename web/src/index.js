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
const debug_host = 'wss://e66d8209.ngrok.io'
=======
const debug_host = 'wss://c82c1c0a.ngrok.io'
>>>>>>> 29b45410c65c4df6b514e102758847df8e676f73

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
