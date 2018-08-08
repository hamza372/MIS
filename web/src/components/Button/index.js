import React  from '../../../../../../../.cache/typescript/2.9/node_modules/@types/react'
import './style.css'

const Button = ({ onClick, children, style={} }) => {

	return <div className="button" onClick={onClick} style={style}>
		{ children }
	</div>
}

export default Button;