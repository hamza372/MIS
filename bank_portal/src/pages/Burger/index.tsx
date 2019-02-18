import React from 'react'
import { Route, Link, RouteComponentProps, withRouter } from 'react-router-dom'
import qs from 'query-string'

import Home from '../Home'
import New from '../New'
import InProgress from '../InProgress'
import Settings from '../Settings'

import SchoolInfo from '~/src/components/SchoolInfo'

import './style.css'

class Burger extends React.Component<RouteComponentProps> {

	onClose = () => {
		this.props.history.push({
			pathname: this.props.location.pathname,
			search: ''
		})
	}

	render() {

		const current = this.props.location.pathname;
		const params = qs.parse(this.props.location.search)
		const selected_id = params.school_id as string;

		return <div className={`root-page ${selected_id ? 'double' : ''}`}>

			<div className="header">EdMarkaz</div>

			<div className="burger">
				<div className="divider">Menu</div>
				<Link to="/" className={current === '/' ? "active" : ""}>Home</Link>
				<Link to="/new" className={current === '/new' ? "active" : ""}>New</Link>
				{ /* <Link to="/todo" className={current === '/todo' ? "active" : ""}>To-Do</Link> */ }
				<Link to="/progress" className={current === '/progress' ? "active" : ""}>In Progress</Link>
				<Link to="/history" className={current === '/history' ? "active" : ""}>Done</Link>
				<Link to="/settings" className={current === '/settings' ? "active" : ""}>Settings</Link>
			</div>

			<div className="burger-stub">
				<Route exact path="/" component={Home} />
				<Route path="/new" component={New} />
				<Route path="/progress" component={InProgress} />
				<Route path="/settings" component={Settings} />
			</div>
				{
					selected_id && <div className="info-panel">
						<div className="close" onClick={this.onClose}>close</div>
						<SchoolInfo school_id={selected_id} />
					</div>
				}
		</div>
	}
}

export default withRouter(Burger);