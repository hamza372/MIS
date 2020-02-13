import React from 'react'

import './style.css'

interface P {
	link?: string
	title?: string
	onClose: () => void
}

const TutorialWindow = (props: P) => {

	const { title, link, onClose } = props

	return <div className="tutorial-window">
		<div className="close button red" onClick={onClose}>✕</div>
		<div className="title">{title}</div>
		<div className="card video">
			<iframe src={link}
				height={320}
				width={"100%"}
				frameBorder={0}
				allowFullScreen
				title={title}
			/>
		</div>
	</div>
}

export default TutorialWindow
