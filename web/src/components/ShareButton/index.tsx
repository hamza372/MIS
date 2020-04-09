import React from 'react'

import { ShareIcon } from 'assets/icons'
import './style.css'

type PropsType = {
	text: string
}

const ShareButton: React.FC<PropsType> = ({ text }) => {

	const whatsapp_link = `https://wa.me/?text=${text}`

	return (<div className="share-button container">
		<a href={encodeURI(whatsapp_link)} className="button share-button whatsapp">
			<img src={ShareIcon} alt="share" height="30" width="32" />
		</a>
	</div>
	)
}

export default ShareButton