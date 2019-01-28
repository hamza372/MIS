import React, { Component } from 'react'
import { connect } from 'react-redux'

interface propTypes {
	connected: boolean,
	login: (id : string, password : string) => void
	auth: RootBankState['auth'],
}

class Login extends Component<propTypes, {}>{

	constructor(props : any) {
		super(props);
	}

	render() {

		if(!this.props.connected) {
			return <div>Connecting...</div>
		}
	}
}

export default connect((state : RootBankState) => ({
	connected: state.connected,
	auth: state.auth
}), dispatch => ({
	login: (id : string, password : string) => dispatch(createLogin(id, password))
}))(Login)