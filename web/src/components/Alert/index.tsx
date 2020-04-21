import React, { useState, useEffect } from 'react'

import './style.css'

type PropsType = {
	title?: string
	text: string
	children?: React.ReactNode
	onCancel?: () => void
	onOK?: () => void
	onSubmit?: (input: string) => void
	error?: string
}

export const MISPrompt: React.FC<PropsType> = (props) => {

	const [code, setCode] = useState("")

	// pasing empty array, makes it work like componentDidMount
	useEffect(() => {
		document.getElementById("promptinput").focus()
	}, [])

	return <>
		<div className="mis-alert">
			<div className="section-container">
				<div className="title">{props.title}</div>
				<div className="row">
					<div>{props.text}</div>
				</div>
				<div className="row">
					<input type="text"
						id="promptinput"
						style={{ width: "100%", paddingLeft: "0.5rem" }}
						onChange={() => setCode}
					/>
				</div>
				{
					props.error && <div className="row" style={{ color: "red" }}>
						<div>{props.error}</div>
					</div>
				}
				<div className="row" style={{ justifyContent: "flex-end" }}>
					<button className="button grey cancel" onClick={props.onCancel}>Cancel</button>
					<button className="button blue ok" onClick={() => props.onSubmit(code)}>OK</button>
				</div>
			</div>
		</div>
	</>
}

export const MISAlert: React.FC<PropsType> = (props) => {

	return <>
		<div className="mis-alert">
			<div className="section-container">
				<div className="title">{props.title}</div>
				<div className="row">
					<div>{props.text}</div>
				</div>
				<div className="row" style={{ justifyContent: "flex-end" }}>
					<button className="button blue ok" onClick={props.onOK}>OK</button>
				</div>
			</div>
		</div>
	</>
}

export const MISConfirm: React.FC<PropsType> = (props) => {

	return <>
		<div className="mis-alert">
			<div className="section-container">
				<div className="title">{props.title}</div>
				<div className="row">
					<div>{props.text}</div>
				</div>
				<div className="row" style={{ justifyContent: "flex-end" }}>
					<button className="button grey cancel" onClick={props.onCancel}>Cancel</button>
					<button className="button blue ok" onClick={props.onOK}>OK</button>
				</div>
			</div>
		</div>
	</>
}