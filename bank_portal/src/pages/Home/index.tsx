import React from 'react'
import { connect } from 'react-redux'

import { forceSaveFullStatePotentiallyCausingProblems } from '~/src/actions'

interface propTypes {

	sync_state: RootBankState['sync_state'],
	saveFullState: () => void
}

class Home extends React.Component<propTypes> {

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