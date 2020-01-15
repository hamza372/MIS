import React from 'react'
import ReactDOM from 'react-dom';

import './style.css'

const modalRoot = document.getElementById('modal-root')

export default class Modal extends React.Component {

	el: HTMLDivElement

	constructor(props: any) {
		super(props);

		this.el = document.createElement('div');
	}

	componentDidMount() {
		modalRoot.appendChild(this.el)
	}

	componentWillUnmount() {
		modalRoot.removeChild(this.el)
	}

	render() {
		return ReactDOM.createPortal(
			<div className="modal-container">
				{ this.props.children }
			</div>,
			this.el
		)
	}
}