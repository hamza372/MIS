import React, { useState } from 'react'

const LoginPage: React.SFC = ({ props }: any) => {

	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")

	const onLoginClick = () => {

		console.log('logging in')
	}

	return <div>
		<div className="row">
			<label>Username: </label>
			<input type="text" onChange={e => setUsername(e.target.value)} value={username} />
		</div>

		<div className="row">
			<label>Password: </label>
			<input type="text" onChange={e => setPassword(e.target.value)} value={password} />
		</div>

		<div className="button" onClick={onLoginClick}>
			Login
		</div>

	</div>

}

export default LoginPage;