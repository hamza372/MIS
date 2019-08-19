import React from 'react'
import { Link } from 'react-router-dom'
import './style.css'

export const Layout = ({ children, title }) => {
	return <div className="layout">
	 <FrontHeader title={title} />
		{ children }
	</div>
}

const FrontHeader = ({title}) => <div className="header bg-red"> 
	<div className="left"><Link to="/signUp">Dashboard-MIS</Link></div>
	<div style={{marginLeft:"auto"}}> {title} </div>
	<Link className="profile" style={{marginRight:"10px"}} to="/signUp">Admin</Link>
</div>

/* const Header = ({user, history}) => <div className="header"> 
	{ (history.location.pathname !== "/landing" && history.location.pathname !== "/" && history.location.pathname !== "/login") && <div className="back" onClick={() => history.goBack()} style={{ backgroundImage: `url(${backIcon})`}} />}
	<div className="left"><Link to="/landing">MISchool</Link></div>
	{ user ? <Link className="profile" to={`/faculty/${user.id}/profile`}>{user.Name}</Link> : false }
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
}))(SpecialLayoutWrap(WrappedComponent)) */