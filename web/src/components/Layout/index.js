import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

import './style.css'

const Layout = ({ user, settings, children }) => {
	return <div className="layout">
		<Header user={user} />
		<div className="print-only">
			<div className="title">{settings.schoolName}</div>
		</div>
		{ children }
	</div>
}

const Header = ({user}) => <div className="header">
	<div className="left"><Link to="/">MIS</Link></div>
	{ user ? <Link className="profile" to={`/faculty/${user.id}/profile`}>Profile</Link> : false }
</div>

export default connect(state => ({ 
	user: Object.values(state.db.faculty)
		.find(x => x.Name === state.auth.name),
	settings: state.db.settings
}))(Layout)