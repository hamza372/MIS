import * as React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Store } from 'redux'
import { connect } from 'react-redux'

import ErrorComponent from 'components/Error'

import InputPage from './pages/input'
import { submitError } from 'actions/core'

interface P {
	store: Store
	sendError: (err: Error, errInfo: React.ErrorInfo) => void
}

interface S {
	error?: {
		err: Error
		errInfo: React.ErrorInfo
	}
}

class Routes extends React.Component<P, S> {

	constructor(props: P) {
		super(props)

		this.state = {
			error: undefined
		}
	}

	componentDidCatch(err: Error, errInfo: React.ErrorInfo) {

		this.props.sendError(err, errInfo)

		this.setState({
			error: {
				err,
				errInfo
			}
		})

	}

	render() {
		const store = this.props.store

		if (this.state.error) {
			return <ErrorComponent error={this.state.error.err} errInfo={this.state.error.errInfo} />
		}

		return <Provider store={store}>
			<BrowserRouter>
				<Switch>
					<Route exact path="/" component={InputPage} />
				</Switch>
			</BrowserRouter>
		</Provider>

	}
}

export default connect(
	(state: RootReducerState) => ({}),
	(dispatch: Function) => ({
		sendError: (err: Error, errInfo: React.ErrorInfo) => dispatch(submitError(err, errInfo))
	})
)(Routes)
