import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link, RouteComponentProps } from 'react-router-dom'
import getSectionsFromClasses  from 'utils/getSectionsFromClasses';
import Layout from 'components/Layout'
import List from 'components/List'

interface P {
	classes: RootDBState["classes"]
}

interface S {

}

interface RouteInfo {
	id: string
}

interface AugmentedSection {
	id: string
	class_id: string
	namespaced_name: string
	className: string
	classYear: number
	name: string
	faculty_id?: string
}

type propTypes = P & RouteComponentProps<RouteInfo>

const ClassItem = (s: AugmentedSection) => {
	const section_id = s.id
	const class_id = s.class_id
	return <Link to={`/planner/${class_id}/${section_id}`} key={s.id}>
		{s.namespaced_name}
	</Link>
}

class PlannerList extends Component <propTypes, S> {

	render() {

		console.log("In planner List", this.props)
		const sections = getSectionsFromClasses(this.props.classes)

		const items = sections
		.sort((a, b) => (a.classYear || 0) - (b.classYear || 0))
		const create = ''

		return <Layout history={this.props.history}>
			<div className="reports-page">
				<div className="title">Sections</div>

				<List
					items={items}
					Component={ClassItem}
					create={create}
					createText={"Date Sheet"}
					toLabel={(C: AugmentedSection) => C.namespaced_name} 
				/>

			</div>
		</Layout>

	}
}

export default connect((state: RootReducerState) => ({
	classes: state.db.classes
}))(PlannerList)
