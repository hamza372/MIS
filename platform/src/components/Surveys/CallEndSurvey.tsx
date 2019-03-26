import React from 'react'
import Former from '~/src/utils/former'

interface P {
	saveSurvey: (survey: CallEndSurvey['meta']) => void
	call_number: number
}

export default class Survey extends React.Component<P, CallEndSurvey['meta']> {

	former : Former

	constructor(props : P) {
		super(props);

		this.state = {
			customer_interest: "",
			reason_rejected: "",
			other_reason_rejected: "",
			customer_likelihood: "",
			follow_up_meeting: "",
			other_notes: "",
			call_number: props.call_number
		}

		this.former = new Former(this, [])

	}

	render() {

		return <div className="modal">
			<div className="title" style={{ marginTop: 0 }}>Call Finished Survey</div>

			<div className="form" style={{ width: "90%"}}>

				<div className="row">
					<label>Is the customer interested in using your product?</label>
					<select {...this.former.super_handle(["customer_interest"])}>
						<option value="">Please Select an Answer</option>
						<option value="YES">Yes</option>
						<option value="UNSURE">Unsure</option>
						<option value="NO">No</option>
					</select>
				</div>

				{ this.state.customer_interest === "NO" && <div className="row">
					<label>Why is the customer not interested in your product?</label>
					<select {...this.former.super_handle(["reason_rejected"])}>
						<option value="">Select </option>
						<option value="PRODUCT_TOO_EXPENSIVE">The Product is too expensive</option>
						<option value="PRODUCT_NOT_RELEVANT">The product is not relevant for them</option>
						<option value="PRODUCT_NOT_GOOD_ENOUGH">The product does not fulfill or address their needs</option>
						<option value="OTHER">Other Reason</option>
					</select>
				</div>
				}

				{ this.state.reason_rejected == "OTHER" && <div className="row">
					<label>Please write why they are not interested</label>
					<input type="text" {...this.former.super_handle(["other_reason_rejected"])} placeholder="" />
				</div> 
				}

				<div className="row">
					<label>How strongly do you feel the client will make a purchase?</label>
					<select {...this.former.super_handle(["customer_likelihood"])}>
						<option value="">Please select an option</option>
						<option value="HIGH">High - I think they will buy from us</option>
						<option value="MEDIUM">Medium - I am not sure</option>
						<option value="LOW">Low - They did not say no, but probably not</option>
						<option value="ZERO">Zero - They will not buy from us</option>
					</select>
				</div>

				<div className="row">
					<label>Will you have another meeting with the client?</label>
					<select {...this.former.super_handle(["follow_up_meeting"])}>
						<option value="">Please Select an Answer</option>
						<option value="YES">Yes</option>
						<option value="NO">No</option>
						<option value="N/A">Not Relevant</option>
					</select>
				</div>

				<div className="row">
					<label>Other Notes</label>
					<input type="text" {...this.former.super_handle(["other_notes"])} placeholder="Enter other notes here" />
				</div>

				<div className="row">
					<div className="button blue" onClick={() => this.props.saveSurvey(this.state)}>Save</div>
				</div>
			</div>
		</div>
	}
}