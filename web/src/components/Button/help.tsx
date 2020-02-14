import React, { Component } from 'react'
import { HelpIcon } from 'assets/icons'
import Modal from 'components/Modal'
import TutorialWindow from 'components/Tutorial'
import { getLinkForPath } from 'constants/links'

import './style.css'

type PropsType = {
	title?: string
	link?: string
}

type S = {
	showTutorial: boolean
}


class HelpButton extends Component<PropsType, S> {
	constructor(props: PropsType) {
		super(props)

		this.state = {
			showTutorial: false
		}
	}

	toggleTutorialWindow = () => {
		this.setState({ showTutorial: !this.state.showTutorial }, () => {
			// on modal shown
			if (this.state.showTutorial) {
				document.body.style.position = "fixed"
			}
		})
	}

	onCloseTutorialWindow = () => {
		this.setState({ showTutorial: false }, () => {
			// on modal hidden
			document.body.style.position = ''
		})
	}

	render() {

		const { title, link } = this.props.title && this.props.link ? this.props : getLinkForPath(window.location.pathname)

		return <>
			<img src={HelpIcon} className="help-button" onClick={this.toggleTutorialWindow} title={"MISchool Tutorial"} alt="help" />
			{
				this.state.showTutorial && <Modal>
					<TutorialWindow
						title={title}
						link={link}
						onClose={this.onCloseTutorialWindow} />
				</Modal>
			}
		</>

	}
}

export default HelpButton