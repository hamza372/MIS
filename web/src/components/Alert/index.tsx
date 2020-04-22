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

	const [input, setInput] = useState("")

	// pasing empty array, makes it works like componentDidMount
	// making focus this way because react only allow to have focus on initial render
	// so that autoFocus doesn't work
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
						onChange={(e) => setInput(e.target.value)}
					/>
				</div>
				{
					props.error && <div className="row error">
						<div>{props.error}</div>
					</div>
				}
				<div className="row actions">
					<button className="button grey cancel" onClick={props.onCancel}>Cancel</button>
					<button className="button blue" onClick={() => props.onSubmit(input)}>OK</button>
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
				<div className="row actions">
					<button className="button blue" onClick={props.onOK}>OK</button>
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
				<div className="row actions">
					<button className="button grey cancel" onClick={props.onCancel}>Cancel</button>
					<button className="button blue" onClick={props.onOK}>OK</button>
				</div>
			</div>
		</div>
	</>
}