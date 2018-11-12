import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import Layout from 'components/Layout'
import List from 'components/List'



const ClassItem = (C) => 
	<Link key={C.id} to={`/class/${C.id}/profile`} >
		{classLabel(C)}
	</Link>

const classLabel = (C) => `${C.name}`;

class ClassModule extends Component {
 
	render() {

		const items = Object.values(this.props.classes)
		.sort((a, b) => (b.classYear || 0) - (a.classYear || 0));
		console.log(items);
		
		return <Layout>
			<div className="class-module">
				<div className="title">Classes</div>
				
				<List 
					items={items}
					Component={ClassItem}
					create={'/class/new'} 
					createText={"Add new Class"} 
					toLabel={classLabel} 
					/>
			</div>
		</Layout>
	}
}

export default connect(state => ({
	classes: state.db.classes
}))(ClassModule)

/*
<List 
  items={items} 
  Component={ExamItem} 
  create={`/reports/${class_id}/${section_id}/new`} 
  createText="New Exam" 
  toLabel={examLabel}
 />
 */