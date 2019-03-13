import React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'

import { addSupplierNumber, editLoginNumber } from '~src/actions';
import Former from '~/src/utils/former'

// this will show up if they logged in supplying a number that isnt in settings.number
// for now we just want them to give their name

interface Props {
	auth: RootBankState['auth'],
	addNumber: (number: string, name: string) => void
	editLogin: (number : string) => void
	number_exists: boolean
}

interface State {
	name: string,
	number: string
}

class VerifyNumber extends React.Component<Props, State> {

	former: Former

	constructor(props : Props) {
		super(props);

		this.state = {
			name: "",
			number: props.auth.number
		}

		this.former = new Former(this, [])
	}

	onSave = () => {

		if(this.state.number !== this.props.auth.number) {
			// if they edited the number, we need to dispatch an action to save it in auth as well
			console.log('edited number')
			this.props.editLogin(this.state.number)
		}

		this.props.addNumber(this.state.number, this.state.name)

	}

	render() {

		if(this.props.number_exists) {
			return <Redirect to="/" />
		}
		return <div className="verify page">
			<div className="title">Verify Your Number</div>

			<div>Hello! You logged in with number {this.props.auth.number}. This number has not yet been registered with IlmExchange. Please supply the following information to proceed</div>

			<div className="form" style={{ width: "90%" }}>
				<div className="row">
					<label>Name</label>
					<input type="text" {...this.former.super_handle(["name"])} placeholder="Name" />
				</div>
				<div className="row">
					<label>Number</label>
					<input type="tel" {...this.former.super_handle(["number"])} placeholder="Your Cellphone Number" />
				</div>

				<div className="button blue" onClick={this.onSave}>Save</div>
			</div>
		</div>
	}
}

export default connect((state : RootBankState) => ({
	auth: state.auth,
	number_exists: state.sync_state.numbers[state.auth.number] !== undefined
}), (dispatch: Function) => ({
	addNumber: (number : string, name: string) => dispatch(addSupplierNumber(number, name)),
	editLogin: (number: string) => dispatch(editLoginNumber(number))
}))(VerifyNumber)