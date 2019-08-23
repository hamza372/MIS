import React from 'react'
import { Route, Link, RouteComponentProps, withRouter } from 'react-router-dom'
import icon from './icon.svg'
import signUp from '../../pages/signUp';
import DashboardPage from '../../pages/stats';

import './style.css'
import trials from '../../pages/trials';

type P = RouteComponentProps

interface S {
	visible: boolean
}

class Accordian extends React.Component<P, S> {

	constructor(props : P) {
		super(props)

		this.state = {
			visible: false
		}
	}

	onMinimize = () => {
		this.setState({
			visible: !this.state.visible
		})
	}

	render() {

		const current = this.props.location.pathname;
		const search = this.props.location.search;

		return <div className={`root-page accordian ${this.state.visible ? "" : "minimized"}`}>
			<div className="header">Mischool Dashboard</div>

			<div className="burger">
				<div className="whopper" onClick={this.onMinimize} style={{ background: `url(${icon}) 50% 0 no-repeat`}} />
				{ this.state.visible && <Link to={{ pathname: "/", search }} className={current === "/" ? "active" : ""}>New School</Link> }
				{this.state.visible && <Link to={{ pathname: "/dashboard/school_id/start_date/end_date/", search }} className={current === "/dashboard/school_id/start_date/end_date/" ? "active" : ""}> Stats</Link>}
				{ this.state.visible && <Link to={{ pathname: "/trials", search }} className={current === "/trials" ? "active" : ""}>Trials</Link> }
			</div>

			<div className="burger-stub">
				<Route exact path="/" component={signUp} />
				<Route path="/dashboard/:school_id/:start_date/:end_date/" component={DashboardPage} />
				<Route path="/trials" component={trials} />
			</div>

		</div>
	}
}

export default withRouter(Accordian);