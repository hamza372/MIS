import React from 'react'
import Link from 'components/Link'

import './style.css'

const List = (props) => {

	return <div className="list">
		{ props.create ? <Create to={props.create} text={props.createText} /> : false }
		{
			props.children.map(C => <div className="list-row">{C}</div>)
		}
	</div>
}

const Create = ({ to, text}) => {
	return <div className="create">
		<Link to={to}>{text}</Link>
	</div>
}

export default List