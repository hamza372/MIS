import React from 'react'
import { Link } from 'react-router-dom'

import './style.css'

const Layout = ({ children }) => {
	return <div className="layout">
		<Header />
		{ children }
	</div>
}

const Header = () => <div className="header">
	<div className="left"><Link to="/">MIS</Link></div>
	<div className="profile">Profile</div>
</div>

export default Layout;