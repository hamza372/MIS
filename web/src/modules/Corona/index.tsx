import React from 'react'
import { connect } from 'react-redux'
import { Link, RouteComponentProps } from 'react-router-dom'

import Layout from 'components/Layout'
import Modal from 'components/Modal'

import './style.css'
import getSectionsFromClasses from 'utils/getSectionsFromClasses'
import Former from 'utils/former'
import NeedyModal from './needy'

type P = {
	students: RootDBState['students']
	classes: RootDBState['classes']
} & RouteComponentProps

interface S {
	filter: {
		section_id: ""
	}
	modal_active: boolean
	active_student?: MISStudent
}

class CoronaModule extends React.Component<P, S> {

	former: Former
	constructor(props: P) {
		super(props)

		this.state = {
			filter: {
				section_id: ""
			},
			modal_active: false
		}

		this.former = new Former(this, [])
	}

	onCheckboxSelect = (student: MISStudent) => () => {

		console.log('checkbox selected for ', student.Name)

		this.setState({
			modal_active: true,
			active_student: student
		})

	}

	onModalClose = () => {

		// save the active student
		this.setState({
			modal_active: false
		})
	}

	render() {

		const sections = getSectionsFromClasses(this.props.classes)

		return <Layout history={this.props.history}>
			<div className="corona">

				{
					this.state.modal_active && <Modal>
						<NeedyModal
							student={this.state.active_student}
							onClose={this.onModalClose}
						/>
					</Modal>
				}

				<div className="title">Corona Module</div>

				<div className="filters">
					<div className="row">
						<label>Section</label>
						<select {...this.former.super_handle(["filter", "section_id"])}>
							<option value="">Select Class</option>
							{
								sections
									.sort((a, b) => a.classYear - b.classYear)
									.map(s => <option key={s.id} value={s.id}>{s.namespaced_name}</option>)
							}
						</select>
					</div>
				</div>
				<table>
					<thead>
						<tr>
							<td>Roll #</td>
							<td>Name</td>
							<td>Father Name</td>
							<td>Needy</td>
						</tr>
					</thead>
					<tbody>
						{
							Object.values(this.props.students)
								.filter(s => this.state.filter.section_id && s.section_id === this.state.filter.section_id)
								.sort((a, b) => parseInt(a.RollNumber) - parseInt(b.RollNumber))
								.map(s => {

									return <tr key={s.id}>
										<td>{s.RollNumber}</td>
										<td>{<Link to={`/student/${s.id}/profile`}>{s.Name}</Link>}</td>
										<td>{s.ManName}</td>
										<td>
											<input type="checkbox" onChange={this.onCheckboxSelect(s)} />
										</td>
									</tr>
								})
						}
					</tbody>
				</table>

			</div>

		</Layout>
	}

}

export default connect((state: RootReducerState) => ({
	students: state.db.students,
	classes: state.db.classes
}))(CoronaModule)