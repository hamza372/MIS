import React, { Component } from 'react'
import { connect } from 'react-redux'
import { v4 } from 'node-uuid'

import Layout from 'components/Layout'
import Former from 'utils/former'

import './style.css'

const blankClass = {
	name: "",
	sections: {
		[v4()]: {
			name: "Section 1",
		}
	},
	subjects: {

	}
}
// we dont save class under its own db
// we save the sections. this will be handled by the action we dispatch on save.
// this view is derived from sections.

class SingleClass extends Component {

	constructor(props) {
		super(props);

		const name = props.match.params.name;

		// todo: separate out the subjects to class-level
		const currClass = name === 'new' ? blankClass : Object.values(props.sections)
				.filter(section => section.class === name)
				.reduce((agg, curr) => {
					return {
						...agg,
						sections: {
							...agg.sections,
							[curr.id]: curr
						}
					}
				}, {
					name,
					sections: { }
				})

		this.state = {
			class: currClass
		}

		this.former = new Former(this, ["class"])
	}

	onSave = () => {
		this.props.save();
	}

	render() {
		return <Layout>
			<div className="single-class">
				<div className="title">Edit Class</div>
				<div className="form">
					<div className="row">
						<label>Name</label>
						<input type="text" {...this.former.super_handle(["name"])} placeholder="Name" />
					</div>

					<div className="divider">Sections</div>

					{
						Object.entries(this.state.class.sections)
							.map(([id, section]) => <div className="row" key={id}>
								<label>Section Name</label>
								<input type="text" {...this.former.super_handle(["sections", id, "name"])} />
							</div>)
					}
				</div>
			</div>
		</Layout>
	}
}

export default connect(state => ({
	sections: state.db.sections
}), dispatch => ({
	save: () => console.log('save')
}))(SingleClass)