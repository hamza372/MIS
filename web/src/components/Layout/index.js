import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import backIcon from './back.svg'
import './style.css'

const Layout = ({ user, children, history }) => {
	return <div className="layout">
	{ history.location.pathname === "/front" ? <FrontHeader user={user} history={history} /> : <Header user={user} history={history}/> }
		{ children }
	</div>
}

const FrontHeader = ({user, history}) => <div className="header bg-red"> 
	<div className="left"><Link to="/front">MISchool</Link></div>
	<div className="profile" style={{marginRight:"10px"}}> Login </div>
</div>

const Header = ({user, history}) => <div className="header"> 
	{ (history.location.pathname !== "/" && history.location.pathname !== "/front") && <div className="back" onClick={() => history.goBack()} style={{ backgroundImage: `url(${backIcon})`}} />}
	<div className="left"><Link to="/">MISchool</Link></div>
	{ user ? <Link className="profile" to={`/faculty/${user.id}/profile`}>{user.Name}</Link> : false }
</div>

export const PrintHeader = ({settings, logo}) => <div className="print-only school-header">
			<div className="header-body">
				<div className="logo-container" style={{width: "20%"}}>
					<img className="header-logo" src={logo} alt="No Logo"/>
				</div>
				<div className="header-style">
					<div className="title">{settings.schoolName}</div>
					<div className="address" style={{marginBottom: "5px"}}>{settings.schoolAddress}</div>
					<div className="phone-number">{settings.schoolPhoneNumber}</div>
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