import React from 'react'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps, Route, Link} from 'react-router-dom'

import Layout from '../../../components/Layout'
import Students from './student'

interface S {

}

type P = RouteComponentProps

class ExcelImport extends React.Component<P, S> {

	constructor(props : P) {
		super(props)

		this.state = {
		}
	}

	render() {

		const loc = this.props.location.pathname.split('/').slice(-1).pop();

		return <Layout history={this.props.history}>
			<div className="excel-import">
				{ /*
				<div className="row tabs">
					<Link className={`button ${loc === 'students' ? 'red' : false}`} to="excel-import/students" replace={true}>Students</Link>
					<Link className={`button ${loc === 'teachers' ? 'blue' : false}`} to="excel-import/teachers" replace={true}>Teachers</Link>
				</div>
				*/ }

				<Route path="/settings/excel-import/students" component={Students} />
			</div>


		</Layout>
	}
}

export default connect((state : RootReducerState) => ({
}), (dispatch : Function) => ({
}))(withRouter(ExcelImport))