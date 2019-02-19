import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { forceSaveFullStatePotentiallyCausingProblems } from '~/src/actions'

interface propTypes {

	sync_state: RootBankState['sync_state'],
	saveFullState: () => void
}

class Home extends React.Component<propTypes> {

	render() {
		// if no number is set in auth, should ask them here
		// ""
		const numbers = this.props.sync_state.numbers;

		return <div className='home page'>
			<div className="title">Home Page</div>

			{
				Object.keys(numbers).length >= 0 && <div>Please add your organizations phone numbers in <Link to="/settings">Settings</Link></div>
			}

		</div>
	}
}

export default connect((state : RootBankState) => ({ 
	sync_state: state.sync_state
}), (dispatch : Function) => ({
	saveFullState: () => dispatch(forceSaveFullStatePotentiallyCausingProblems())
}))(Home)