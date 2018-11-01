import * as React  from "react"
import * as ReactDOM from "react-dom"

import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import reducer from './reducers'

import Routes from './routes'

const store = createStore(reducer, applyMiddleware(thunkMiddleware));
console.log(store)
ReactDOM.render(
	<Routes store={store}/>,
	document.getElementById("root")
)