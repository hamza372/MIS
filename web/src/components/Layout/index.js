import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import backIcon from './back.svg'
import './style.css'

const Layout = ({ user, children, history }) => {
	return <div className="layout">
	{ history.location.pathname === "/" ? <FrontHeader user={user} history={history} /> : <Header user={user} history={history}/> }
		{ children }
	</div>
}

const FrontHeader = ({user, history}) => <div className="header bg-red"> 
	<div className="left"><Link to="/landing">MISchool</Link></div>
	{ user ? <Link className="profile" to={`/faculty/${user.id}/profile`}>{user.Name}</Link> : 	<Link className="profile" style={{marginRight:"10px"}} to="/login">Login</Link>
 }
</div>

const Header = ({user, history}) => <div className="header"> 
	{ (history.location.pathname !== "/landing" && history.location.pathname !== "/" && history.location.pathname !== "/login") && <div className="back" onClick={() => history.goBack()} style={{ backgroundImage: `url(${backIcon})`}} />}
	<div className="left"><Link to="/landing">MISchool</Link></div>
	{ user ? <Link className="profile" to={`/faculty/${user.id}/profile`}>{user.Name}</Link> : false }
</div>

export const PrintHeader = ({settings, logo}) => <div className="print-only school-header">
			<div className="header-body">
				<div className="logo-container" style={{width: "20%"}}>
					{logo !== "" && <img className="header-logo" src={logo} alt="School Logo"/>}
				</div>
				<div className="header-style">
					<div className="title">{settings.schoolName ? settings.schoolName.toUpperCase() : ""}</div>
					<div className="address" style={{marginBottom:"4px"}}>{settings.schoolAddress}</div>
					<div className="phone-number">
						Tel:{settings.schoolPhoneNumber}</div>
					
					{ settings.schoolCode && settings.schoolCode !== "" && <div className="school-code">
						School Code: {settings.schoolCode || "_______"}					
					</div>}

				</div>
			</div>
		</div>

export default connect(state => ({ 
	user: state.db.faculty[state.auth.faculty_id]
}))(Layout)

const SpecialLayoutWrap = WrappedComponent => ({ user, ...props}) => <div className="layout">
	{ props.history.location.pathname === "/front" ? <FrontHeader user={user} history={props.history} /> : <Header user={user} history={props.history}/> }
	<WrappedComponent {...props} />
</div>

export const LayoutWrap = WrappedComponent => connect(state => ({
	user: state.db.faculty[state.auth.faculty_id],
}))(SpecialLayoutWrap(WrappedComponent))