import React from 'react'
import { connect } from 'react-redux'

import { forceSaveFullStatePotentiallyCausingProblems } from '~/src/actions'

interface propTypes {

	sync_state: RootBankState['sync_state'],
	saveFullState: () => void
}

class Home extends React.Component<propTypes> {

	componentDidMount() {
		// if we have 0 matches, save the state from the frontend.... 
		// though this should happen in secondary login? or something.
		// TODO: lock in login/user flow

		if(Object.keys(this.props.sync_state.matches).length === 0) {
			// no matches exist for this... we need to init this in the db
			// this case may not exist outside of testing
			// also we should be able to know if this is the first login
			// it shouldn't keep happening over and over.
			console.log("=========================")
			console.log("force saving full state")
			console.log("==========================")
			this.props.saveFullState();
		}
	}

	render() {
		return <div className='home page'>
			<div className="title">Home Page</div>
		</div>
	}
}

export default connect((state : RootBankState) => ({ 
	sync_state: state.sync_state
}), (dispatch : Function) => ({
	saveFullState: () => dispatch(forceSaveFullStatePotentiallyCausingProblems())
}))(Home)