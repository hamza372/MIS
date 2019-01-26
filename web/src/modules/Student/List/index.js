import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import qs from 'query-string'
import {getSectionsFromClasses} from 'utils/getSectionsFromClasses';

import { LayoutWrap } from 'components/Layout';
import List from 'components/List';
import Title from 'components/Title';
import {PrintHeader} from 'components/Layout';

import './style.css'

const StudentItem = (S) => {

	if(S.header) {
		return <div key="unique1245" className="table row heading">
			<label> <b> Name </b></label>
			<label> <b> Father Name </b></label>
			<label> <b> Class Section </b></label>
		</div>
	} 

	const cname = S.relevant_section ? S.relevant_section.className : "no class";
//const sname = S.relevant_section.includes("namespaced_name") ? S.relevant_section.namespaced_name : "No Section"; 
	
	return <div className="table row" key={S.id}>
				<Link to={`/student/${S.id}/${S.forwardTo}`} key={S.id}>
					{S.Name} 
				</Link>
				<div>{S.ManName !== "" || null ? S.ManName : "" }</div>
				<div> {cname /*+ "/" + sname */}</div>
			</div>
}

const toLabel = (S) => {
	
	const cname = S.relevant_section ? S.relevant_section.className : "no class";

	return S.Name + S.ManName + cname ;

}

export const StudentList = ({ classes, students, settings, forwardTo, history }) => {

	const sections = getSectionsFromClasses(classes)	
	
	const items = Object.entries(students)
	.filter(([, s]) => s.id && s.Name) // hiding the error for now.... need to build reporting mechanism
	.sort(([,a], [,b]) => a.Name.localeCompare(b.Name))
	.map( ([id, student]) => {
		const relevant_section = sections.find(section => student.section_id === section.id);
		return { 
			...student,
			relevant_section,
			id,
			forwardTo
		} 
	});	

	let create = '/student/new'

	if(forwardTo === 'marks' || forwardTo === 'payment'){
		create = '';
	}

	return <div className="student-list">
		<PrintHeader settings={settings} />
		<Title className="title">Students</Title>
		<List 
			items = {[ { Name: "", header: true }, ...items]}
			Component = {StudentItem}
			create = {create} 
			createText = {"Add new Student"} 
			toLabel = {toLabel} /> 

		<div className="print button" onClick={() => window.print()}>Print</div>
	</div>
}

export default connect((state, { location }) => ({ 
	students: state.db.students,
	classes: state.db.classes,
	settings: state.db.settings,
	forwardTo: qs.parse(location.search, { ignoreQueryPrefix: true }).forwardTo || "profile"
}))(LayoutWrap(StudentList));