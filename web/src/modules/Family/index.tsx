import React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom'
import List from 'components/List'

import Layout from 'components/Layout'

interface Families {
	[family_id: string]: Family;
}

interface Family {
	id: string;
	students: {
		[id: string]: MISStudent;
	};
}

interface S {

}

type P = {
	students: RootDBState['students'];
} & RouteComponentProps

class FamilyModule extends React.Component<P, S> {

	render() {
		// here 

		const reduced: Families = Object.values(this.props.students)
			.reduce((agg, curr) => {

				if(!curr.FamilyID) {
					return agg;
				}

				const k = `${curr.FamilyID}`

				const existing = agg[k]
				if(existing) {
					return {
						...agg,
						[k]: {
							id: k,
							students: {
								...agg[k].students,
								[curr.id]: curr
							}
						}
					}
				}
				else {
					return {
						...agg,
						[k]: {
							id: k,
							students: {
								[curr.id]: curr
							}
						}
					}
				}

			}, {} as Families)
		
		const families = Object.entries(reduced)
			.filter(([fid, f]) => Object.values(f.students).length > 0)
			.reduce((agg, [fid, f]) => {
				return {
					...agg,
					[fid]: f
				}
			}, {} as Families)

		return <Layout history={this.props.history}>
			<div className="family">
				<div className="title">Families</div>
				<List 
					items={Object.values(families)}
					Component={FamilyItem}
					toLabel={(fam: Family) => fam.id}
				/>
			</div>
		</Layout>
	}
}

const FamilyItem: React.SFC<Family> = ({ id, students }) => {

	return <Link key={id} to={`/families/${id}`}>{id}</Link>
}

export default connect((state: RootReducerState) => ({
	students: state.db.students
}))(FamilyModule)