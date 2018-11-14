import React  from 'react' 
import './style.css'

const Button = ({ onClick, children, style={} }) => {

	return <div className="button" onClick={onClick} style={style}>
		{ children }
	</div>
}

export default Button;