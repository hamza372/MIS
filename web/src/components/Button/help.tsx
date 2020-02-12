import React, { Component } from 'react'
import { HelpIcon } from 'assets/icons'
import Modal from 'components/Modal'
import TutorialWindow from 'components/Tutorial'
import { TutorialLinks } from 'constants/links'

import './style.css'

type PropsType = {
	tutorialID: string
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
			if (this.state.showTutorial) {
				document.body.style.position = "fixed"
			}
		})
	}

	onCloseTutorialWindow = () => {
		this.setState({ showTutorial: false }, () => {
			document.body.style.position = ''
		})
	}

	render() {

		const { tutorialID } = this.props

		const { title, link } = TutorialLinks[tutorialID] ? TutorialLinks[tutorialID] : { title: "", link: "" }

		return <>
			<img src={HelpIcon} className="help-button" onClick={this.toggleTutorialWindow} alt="help-icon" />
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