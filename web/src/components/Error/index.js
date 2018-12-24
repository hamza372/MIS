import React from 'react'

import './style.css'

export default ({ err, errInfo, history }) => {

	return <div className="error-page">
		<h1>MISchool Error</h1>
		<h2>Please call 0341 0924942 or send screenshot</h2>
		<p>To try and continue, press back and refresh page.</p>
		<p>{err.toString()}</p>
		<p>{errInfo.componentStack}</p>
	</div>
}