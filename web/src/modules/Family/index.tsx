import React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router';

import Layout from '../../components/Layout'

interface S {

}

type P = {
	students: RootDBState['students']
} & RouteComponentProps

class FamilyModule extends React.Component<P, S> {

	render() {
		// here 
		type Families = {
			[family_id: string]: {
				[id: string]: MISStudent
			}
		}

		const reduced : Families = Object.values(this.props.students)
			.reduce((agg, curr) => {

				if(!curr.Phone && !curr.FamilyID && !curr.ManCNIC) {
					return agg;
				}

				const k = `${curr.Phone}-${curr.FamilyID}-${curr.ManCNIC}`

				const existing = agg[k]
				if(existing) {
					return {
						...agg,
						[k]: {
							...agg[k],
							[curr.id]: curr
						}
					}
				}
				else {
					return {
						...agg,
						[k]: {
							[curr.id]: curr
						}
					}
				}

			}, {} as Families)
		
		const families = Object.entries(reduced)
			.filter(([fid, f]) => Object.values(f).length > 1)
			.reduce((agg, [fid, f]) => {
				return {
					...agg,
					[fid]: f
				}
			}, {} as Families)
		
		console.log(families)

		return <Layout history={this.props.history}>
			<div className="family">
				<div className="title">Families</div>
			</div>
		</Layout>
	}
}

export default connect((state : RootReducerState) => ({
	students: state.db.students
}))(FamilyModule)