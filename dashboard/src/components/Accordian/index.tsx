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

		const { visible } = this.state
		const { permissions, role } = this.props

		const new_school = permissions && permissions.new_school
		const stats = permissions && permissions.stats
		const new_user = permissions && permissions.new_user
		const trials = permissions && permissions.trials

		const admin = role === "ADMIN" ? true : false

		return <div className={`root-page accordian ${visible ? "" : "minimized"}`}>

			<div className="header" style={{ justifyContent: "space-between" }}>
				<div className="icon" onClick={this.onMinimize} style={{ background: `url(${icon}) 50% 0 no-repeat` }} />
				<div>Mischool Dashboard</div>
				<div>{this.props.user}</div>
			</div>

			{visible && <div className="burger">
				{(new_school || admin) && <Link to={{ pathname: "/", search }} className={current === "/" ? "active" : ""}>New School</Link>}
				{(stats || admin) && <Link to={{ pathname: "/dashboard/school_id/start_date/end_date/", search }} className={current === "/dashboard/school_id/start_date/end_date/" ? "active" : ""}> Stats</Link>}
				{(trials || admin) && <Link to={{ pathname: "/trials", search }} className={current === "/trials" ? "active" : ""}>Trials</Link>}
				{admin && <Link to={{ pathname: "/admin", search }} className={current === "/admin" ? "active" : ""}>Admin</Link>}
				{(new_user || admin) && <Link to={{ pathname: "/user/new", search }} className={current === "/user/new" ? "active" : ""}>New User</Link>}
				<Link to="" onClick={() => this.onLogout()}> LOGOUT </Link>
			</div>}

			<div className={ visible ? "burger-stub" : "burger-stub full-view"} >
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