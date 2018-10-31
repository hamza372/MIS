import React from 'react'
import { Link } from 'react-router-dom'

import './style.css'

const List = (props) => {

	return <div className="list-wrap">
		{ props.create ? <Create to={props.create} text={props.createText} /> : false }
		<div className="list">
			{
				props.children.map(C => <div className="list-row" key={Math.random()}>{C}</div>)
			}
		</div>
	</div>
}

const Create = ({ to, text}) => {
	return <Link className="button" to={to}>{text}</Link>
}

export default List