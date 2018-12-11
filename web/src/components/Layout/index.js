import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

import './style.css'

const Layout = ({ user, children }) => {
	return <div className="layout">
		<Header user={user} />
		{ children }
	</div>
}

const Header = ({user}) => <div className="header">
	<div className="left"><Link to="/">MISchool</Link></div>
	{ user ? <Link className="profile" to={`/faculty/${user.id}/profile`}>{user.Name}</Link> : false }
</div>

export const PrintHeader = ({settings}) => <div className="print-only school-header">
			<div className="title">{settings.schoolName}</div>
			<div className="address">{settings.schoolAddress}</div>
			<div className="phone-number">{settings.schoolPhoneNumber}</div>
		</div>

export default connect(state => ({ 
	user: Object.values(state.db.faculty)
		.find(x => x.Name === state.auth.name),
}))(Layout)

const SpecialLayoutWrap = WrappedComponent => ({ user, ...props}) => <div className="layout">
	<Header user={user} />
	<WrappedComponent {...props} />
</div>

export const LayoutWrap = WrappedComponent => connect(state => ({
	user: state.db.faculty[state.auth.faculty_id]
}))(SpecialLayoutWrap(WrappedComponent))