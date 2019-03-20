import React from 'react'
import Former from '~/src/utils/former'

interface P {
	saveSurvey: (survey: MarkCompleteSurvey['meta']) => void
}

export default class Survey extends React.Component<P, MarkCompleteSurvey['meta']> {

	former : Former

	constructor(props : P) {
		super(props);

		this.state = {
			reason_completed: "",
			other_reason: ""
		}

		this.former = new Former(this, [])

	}

	render() {
		return <div className="modal">
			<div className="title">Marked as Complete</div>

			<div className="form" style={{ width: "90%"}}>
				<div className="row">
					<label>Reason for marking as complete</label>
					<select {...this.former.super_handle(["mark_complete_survey", "reason_completed"])}>
						<option value="">Select Reason</option>
						<option value="CLIENT_BOUGHT_PRODUCT">Client has purchased our product</option>
						<option value="CLIENT_NOT_INTERESTED">Client not interested in our product</option>
						<option value="CLIENT_NOT_REACHABLE">Unable to contact the Client</option>
						<option value="HANDLING_OUTSIDE_PLATFORM">No longer need to track in the website</option>
						<option value="RELEASE_MASKED_NUMBER">Need to clear this client so we can call a new one</option>
					</select>
				</div>
				{ this.state.reason_completed == "OTHER" && <div className="row">
					<label>Other Reason</label>
					<input type="text" {...this.former.super_handle(["mark_complete_survey", "other_reason"])} placeholder="Other Reason" />
				</div>
				}

				<div className="row">
					<div className="button blue" onClick={() => this.props.saveSurvey(this.state)}>Save</div>
				</div>

			</div>
		</div>
	}
}