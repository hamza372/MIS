import React from 'react'
import { Route, Link, RouteComponentProps, withRouter } from 'react-router-dom'
import icon from './icon.svg'
import signUp from 'pages/signUp';
import DashboardPage from 'pages/stats';

import './style.css'
import Trials from 'pages/trials';
import AdminActions from 'pages/admin';
import newUser from 'pages/admin/newUser';
import { connect } from 'react-redux';

interface P {
	user: string | undefined
	permissions: RootReducerState["auth"]["permissions"]
	role: string | undefined
}

type propTypes = RouteComponentProps & P

interface S {
	visible: boolean
}

class Accordian extends React.Component<propTypes, S> {

	constructor(props : propTypes) {
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

	onLogout = () => {

		if (window.confirm("Are you sure you want to LOGOUT ?")) {
			localStorage.removeItem('auth')
			window.location.reload()
		}
		return
	}

	render() {

		const current = this.props.location.pathname;
		const search = this.props.location.search;

		const { permissions, role } = this.props

		const new_school = permissions && permissions.new_school
		const stats = permissions && permissions.stats
		const new_user = permissions && permissions.new_user
		const trials = permissions && permissions.trials

		const admin = role === "ADMIN" ? true : false

		return <div className={`root-page accordian ${this.state.visible ? "" : "minimized"}`}>
			<div className="header" style={{ justifyContent: "space-between"}}>
				<div>Mischool Dashboard</div>
				<div>{this.props.user}</div>
			</div>

			<div className="burger">
				<div className="whopper" onClick={this.onMinimize} style={{ background: `url(${icon}) 50% 0 no-repeat`}} />
				{ this.state.visible && (new_school || admin) && <Link to={{ pathname: "/", search }} className={current === "/" ? "active" : ""}>New School</Link> }
				{ this.state.visible && ( stats || admin ) && <Link to={{ pathname: "/dashboard/school_id/start_date/end_date/", search }} className={current === "/dashboard/school_id/start_date/end_date/" ? "active" : ""}> Stats</Link>}
				{ this.state.visible && ( trials || admin) &&<Link to={{ pathname: "/trials", search }} className={current === "/trials" ? "active" : ""}>Trials</Link> }
				{this.state.visible && admin && <Link to={{ pathname: "/admin", search }} className={current === "/admin" ? "active" : ""}>Admin</Link>}
				{this.state.visible && ( new_user || admin ) && <Link to={{ pathname: "/user/new", search }} className={current === "/user/new" ? "active" : ""}>New User</Link>}
				{ this.state.visible && <Link to="" onClick={() => this.onLogout()}> LOGOUT </Link>}
			</div>

			<div className="burger-stub">
				<Route exact path="/" component={signUp} />
				<Route path="/dashboard/:school_id/:start_date/:end_date/" component={DashboardPage} />
				<Route path="/trials" component={Trials} />
				<Route exact path="/admin" component={AdminActions} />
				<Route exact path="/user/new" component={newUser} />
			</div>
		</div>
	}
}

export default connect((state: RootReducerState) => ({
	user: state.auth.id,
	permissions: state.auth.permissions,
	role: state.auth.role
}))(withRouter(Accordian));