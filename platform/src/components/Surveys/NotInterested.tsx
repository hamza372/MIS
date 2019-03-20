import React from 'react'
import Former from '~/src/utils/former'

interface P {
	saveSurvey: (survey: NotInterestedSurvey['meta']) => void
}

export default class Survey extends React.Component<P, NotInterestedSurvey['meta']> {

	former : Former

	constructor(props : P) {
		super(props);

		this.state = {
			reason_rejected: "",
		}

		this.former = new Former(this, [])

	}

	render() {
		return <div className="modal">
			<div className="title">Marked Not Interested</div>

			<div className="form" style={{ width: "90%"}}>

				<div className="row">
					<label>Why are you not interested in this school?</label>
					<input type="text" {...this.former.super_handle(["reason_rejected"])} placeholder="Enter reason here" />
				</div>

				<div className="row">
					<div className="button blue" onClick={() => this.props.saveSurvey(this.state)}>Save</div>
				</div>
			</div>
		</div>
	}
}