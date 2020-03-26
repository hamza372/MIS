import React from 'react'

import './style.css'

interface PropsType {
	children?: any
}

const DropdownMenu: React.FC<PropsType> = ({ children }) => {

	return <div className="dropdown-inner-container">
		<div className="dropdown-menu">
			{children}
		</div>
	</div>
}

export default DropdownMenu