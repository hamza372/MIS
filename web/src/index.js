import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import reducer from './reducers'

import Routes from './routes'
import { saveDB } from 'utils/localStorage';

const store = createStore(reducer, applyMiddleware(thunkMiddleware));

store.subscribe(() => {
	saveDB(store.getState())
})

ReactDOM.render(<Routes store={store} />, document.getElementById('root'));
registerServiceWorker();
