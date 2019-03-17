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
import getStudentLimt from 'utils/getStudentLimit';

const StudentItem = (S) => {

	if(S.header) {
		return <div key="unique1245" className="table row heading">
			<label> <b> Name </b></label>
			<label> <b> Father Name </b></label>
			{ S.forwardTo !== "prospective-student" && <label> <b> Class Section </b> </label> }
		</div>
	} 

	const cname = S.relevant_section ? S.relevant_section.className : "no class";
//const sname = S.relevant_section.includes("namespaced_name") ? S.relevant_section.namespaced_name : "No Section"; 
	
	return <div className="table row" key={S.id}>
				<Link to={`/student/${S.id}/${S.forwardTo}`} key={S.id}>
					{S.Name} 
				</Link>
				<div>{S.ManName !== "" || null ? S.ManName : "" }</div>
				{ S.forwardTo !== "prospective-student" && <div> {cname /*+ "/" + sname */}</div> }
			</div>
}

const toLabel = (S) => {
	
	const cname = S.relevant_section ? S.relevant_section.className : "no class";

	return S.Name + S.ManName + cname ;

}

export const StudentList = ({ classes, students, settings, forwardTo, schoolLogo, max_limit }) => {

	const sections = getSectionsFromClasses(classes)	
	
	let items = Object.entries(students)
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
	let createText = "Add new Student"
	
	if(forwardTo === 'marks'){
		create = '';
	}

	if(getStudentLimt(students, max_limit)) {
		create = ''
	}

	if(forwardTo === "prospective-student"){
		create = "/student/prospective-student/new"
		createText = "New Prospective Student"
		items = items.filter(s => (s.tags !== undefined ) && (s.tags["PROSPECTIVE"]))
	}
	else{
		items = items.filter(s => (s.tags === undefined || !s.tags["PROSPECTIVE"]))
	}

	if(forwardTo === 'payment'){
		create = '/fees/manage'
		createText = "Manage Fees"
	}

	return <div className="student-list">
		<PrintHeader settings={settings} logo={schoolLogo} />
		<Title className="title">Students</Title>
		<List 
			items = {[ { Name: "", header: true, forwardTo }, ...items]}
			Component = {StudentItem}
			create = {create} 
			createText = {createText} 
			toLabel = {toLabel} /> 

		<div className="print button" onClick={() => window.print()}>Print</div>
	</div>
}

export default connect((state, { location }) => ({ 
	students: state.db.students,
	classes: state.db.classes,
	settings: state.db.settings,
	schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : "", 
	forwardTo: qs.parse(location.search, { ignoreQueryPrefix: true }).forwardTo || "profile",
	max_limit: state.db.max_limit || -1
}))(LayoutWrap(StudentList));