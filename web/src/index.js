import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

import { createStore } from 'redux'
import reducer from './reducers'

import Routes from './routes'

const store = createStore(reducer);

ReactDOM.render(<Routes store={store} />, document.getElementById('root'));
registerServiceWorker();
