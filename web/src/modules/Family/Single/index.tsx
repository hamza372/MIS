import React from 'react'
import { connect } from 'react-redux'
import Layout from '../../../components/Layout';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom'
import Dynamic from '@ironbay/dynamic'

import Former from '../../../utils/former';
import Dropdown from '../../../components/Dropdown';
import { addStudentToFamily, saveFamilyInfo } from '../../../actions';
import Hyphenator from '../../../utils/Hyphenator';

type P = {
	students: RootDBState['students']
	addStudentToFamily: (s : MISStudent, famId: string) => void
	saveFamilyInfo: (siblings: MISStudent[], familyInfo: MISFamilyInfo) => void
} & RouteComponentProps<RouteInfo>

interface RouteInfo {
	id: string
}

interface S {
	Phone: string
	ManName: string
	ManCNIC: string
	Address: string
}

class SingleFamily extends React.Component<P, S> {

	former: Former
	constructor(props: P) {
		super(props);

		const siblings = this.siblings()

		this.state = {
			Phone: (siblings.find(s => s.Phone != "") || { Phone: ""}).Phone,
			ManName: (siblings.find(s => s.ManName!= "") || { ManName: ""}).ManName,
			ManCNIC: (siblings.find(s => s.ManCNIC != "") || { ManCNIC: ""}).ManCNIC,
			Address: (siblings.find(s => s.Address != "") || { Address: ""}).Address
		}

		this.former = new Former(this, [])

	}

	famId = () => this.props.match.params.id

	siblings = () => {

		const famId = this.famId();
		return Object.values(this.props.students)
			.filter(s => s.Name && s.FamilyID === famId)
	}

	addStudent = (student: MISStudent) => {

		// dispatch write to edit their family id
		this.props.addStudentToFamily(student, this.props.match.params.id)
	}

	addHyphens = (path : string[]) => () => {
		
		const str = Dynamic.get(this.state, path) as string;
		this.setState(Dynamic.put(this.state, path, Hyphenator(str)) as S)
	}

	onSave = () => {
		this.props.saveFamilyInfo(this.siblings(), this.state)
	}

	siblingsUnMatchingInfo = () => {

		const siblings = this.siblings();

		// check if they have same phone
		return siblings.some(s => s.Phone !== siblings[0].Phone ||
			s.ManCNIC !== siblings[0].ManCNIC ||
			s.ManName !== siblings[0].ManName ||
			s.Address !== siblings[0].Address)

	}

	render() {

		return <Layout history={this.props.history}>
			<div className="single-family">
				<div className="title">Family Page</div>

				<div className="form" style={{ width: "90%" }}>
					<div className="row">
						<label>Family ID Code</label>
						<div>{this.famId()}</div>
					</div>

					<div className="row">
						<label>Father Name</label>
						<input type="text" {...this.former.super_handle(["ManName"])} placeholder="Father Name" />
					</div>

					<div className="row">
						<label>Father CNIC</label>
						<input 
							type="tel"
							{...this.former.super_handle(
								["ManCNIC"],
								(num) => num.length <= 15,
								this.addHyphens(["profile", "ManCNIC"]))
							} 
							placeholder="Father CNIC"  />
					</div>

					<div className="row">
						<label>Address</label>
						<input type="text" {...this.former.super_handle(["Address"])} placeholder="Address" />
					</div>

					<div className="row">
						<label>Phone Number</label>
						<div className="row" style={{ flexDirection:"row" }}>
							<input 
								style={{ width:"100%" }}
								type="tel"
								{...this.former.super_handle(["Phone"], (num) => num.length <= 11)}
								placeholder="Phone Number" 
							/>
							<a className="button blue call-link" href={`tel:${this.state.Phone}`}> Call</a>
						</div>
					</div>

					<div className="divider">Siblings</div>
					<div className="section">
					{
						this.siblings().map(s => <div className="row" key={s.id}>
							<Link to={`/student/${s.id}/profile`}>{s.Name}</Link>
						</div>)
					}
					</div>
					{ this.siblingsUnMatchingInfo() && <div className="warning">
						Warning: Some siblings do not have matching information. Press Save to overwrite
					</div> }

					<div className="row">
						<div>Add Sibling</div>
						<Dropdown
							items={Object.values(this.props.students)}
							toLabel={(s : MISStudent) => s.Name}
							onSelect={this.addStudent}
							toKey={(s : MISStudent) => s.id}
							placeholder="Student Name" />
					</div>

					<div className="save button" onClick={this.onSave}>Save</div>
				</div>

			</div>

		</Layout>
	}
}

export default connect((state : RootReducerState) => ({
	students: state.db.students
}), (dispatch : Function) => ({
	addStudentToFamily: (s : MISStudent, famId: string) => dispatch(addStudentToFamily(s, famId)),
	saveFamilyInfo: (siblings: MISStudent[], info: MISFamilyInfo) => dispatch(saveFamilyInfo(siblings, info))
}))(SingleFamily)