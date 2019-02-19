import React from 'react'
import { connect } from 'react-redux'
import Former from '~/src/utils/former'

import { addSupplierNumber } from '~/src/actions'

interface propTypes {
	numbers: RootBankState['sync_state']['numbers'],
	addNumber: (number: string, name: string) => void
}

interface stateType {
	current_number: string,
	current_name: string,
}

class Settings extends React.Component<propTypes, stateType> {

	former: Former

	constructor(props : propTypes) {
		super(props)

		this.state = {
			current_number: "",
			current_name: ""
		}

		this.former = new Former(this, [])
	}

	addNumber = () => {
		this.props.addNumber(this.state.current_number, this.state.current_name)
		this.setState({
			current_name: "",
			current_number: ""
		})
	}

	componentWillReceiveProps(nextProps: propTypes) {
	}

	render() {

		console.log(this.props)
		return <div className="page">
			<div className="title">Settings</div>

			<div className="form" style={{ width: "90%" }}>

				<div className="divider">Add New Number</div>
				<div className="row">
					<label>Number</label>
					<input type="tel" {...this.former.super_handle(["current_number"])} placeholder="New Number"/>
				</div>
				<div className="row">
					<label>Name</label>
					<input type="text" {...this.former.super_handle(["current_name"])} placeholder="Name" />
				</div>
				<div className="button green" onClick={this.addNumber}>+</div>
				<div className="divider">Existing Numbers</div>
				{
					Object.entries(this.props.numbers)
						.map(([number, info]) => {
							return <div className="row" key={number}>
								<div>{info.name}</div>
								<div>{number}</div>
							</div>
						})
				}
			</div>
		</div>

	}
}

export default connect((state : RootBankState) => ({
	numbers: state.sync_state.numbers || {}
}), (dispatch: (x: any) => void) => ({
	addNumber: (number: string, name: string) => dispatch(addSupplierNumber(number, name))
}))(Settings)