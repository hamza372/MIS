import React from 'react'
import { Route, Link, RouteProps } from 'react-router-dom'

import Home from '../Home'
import New from '../New'
import Settings from '../Settings'

import './style.css'

export default class Burger extends React.Component<RouteProps> {

	render() {

		const current = this.props.location.pathname;
		//const params = qs.parse(this.props.location.search)
		//console.log(params)

		return <div className="root-page">

			<div className="header">EdMarkaz</div>

			<div className="burger">
				<div className="divider">Menu</div>
				<Link to="/" className={current === '/' ? "active" : ""}>Home</Link>
				<Link to="/new" className={current === '/new' ? "active" : ""}>New</Link>
				<Link to="/todo" className={current === '/todo' ? "active" : ""}>To-Do</Link>
				<Link to="/progress" className={current === '/progress' ? "active" : ""}>In Progress</Link>
				<Link to="/history" className={current === '/history' ? "active" : ""}>History</Link>
				<Link to="/settings" className={current === '/settings' ? "active" : ""}>Settings</Link>
			</div>

			<div className="burger-stub" style={{ border: "1px solid black"}}>
				<Route exact path="/" component={Home} />
				<Route path="/new" component={New} />
				<Route path="/settings" component={Settings} />
			</div>

			{
				// after burger stub we can have another stub for info page
				// we can also load the id from the route params.
				// so every time we select a school we just stick that 
				// state in the url and go from there.
			}
		</div>
	}
}