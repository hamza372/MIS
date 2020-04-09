import React from 'react'
import Former from 'utils/former';

interface P {
	student: MISStudent
	onClose: () => void
}

export interface NeedyForm {
	needy: "NOT_NEEDY" | "SOMEWHAT_NEEDY" | "EXTREMELY_NEEDY" | "DONT_KNOW" | "" // between 0-5
}

interface S {
	needy_form: NeedyForm
}

class NeedyModal extends React.Component<P, S> {

	former: Former
	constructor(props: P) {
		super(props)

		this.former = new Former(this, ["needy_form"])

		this.state = {
			needy_form: {
				needy: ""
			}
		}
	}

	render() {
		return <div className="needy-form">

			<div className="title">Neediness Form</div>

			<div className="form">
				<div className="row">
					<label>On a scale of 1-5, how needy?</label>
					<select {...this.former.super_handle(["needy"])}>
						<option value="">Select Option</option>
						<option value="NOT_NEEDY">Not Needy</option>
						<option value="SOMEWHAT_NEEDY">Somewhat Needy</option>
						<option value="EXTREMELY_NEEDY">Extremely Needy</option>
					</select>
				</div>

				<div className="button blue" onClick={this.props.onClose}>Save</div>

			</div>

		</div>
	}
}

export default NeedyModal;