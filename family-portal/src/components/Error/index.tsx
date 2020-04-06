import React from 'react'

interface P {
	error: Error
	errInfo: React.ErrorInfo
}

export default ({ error, errInfo }: P) => {

	return <div className="error-page">
		Error!

		<div>{error.name}</div>
		<div>{error.message}</div>
		<div>{errInfo.componentStack}</div>
	</div>
}