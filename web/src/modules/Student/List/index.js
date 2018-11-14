import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from 'components/Layout';
import List from 'components/List';
import Title from 'components/Title';
import {getSectionsFromClasses} from 'utils/getSectionsFromClasses';

const StudentItem = (S) => {

	if(S.special) {
		return tableTitle();
	}

	const cname = S.relevant_section ? S.relevant_section.className : "no class";
	//const sname = S.relevant_section.includes("namespaced_name") ? S.relevant_section.namespaced_name : "No Section"; 
	
	return <div className="table row" key={S.id}>
				<Link to={`/student/${S.id}/profile`} key={S.id}>
					{S.Name} 
				</Link>
				<div>{S.ManName !== "" || null ? S.ManName : "Null" }</div>
				<div> {cname /*+ "/" + sname */}</div>
			</div>
}

const tableTitle = () => {
	return   <div key="unique1245" className="table row heading">
					<label> <b> Name </b></label>
					<label> <b> Father Name </b></label>
					<label> <b> Class Section </b></label>
		 		</div>
}

const StudentList = (props) => {

	const sections = getSectionsFromClasses(props.classes)	
	
	const items = Object.entries(props.students)
	.sort(([,a], [,b]) => a.Name.localeCompare(b.Name))
	.map( ([id, student]) => {
		const relevant_section = sections.find(section => student.section_id === section.id);
		return { 
			...student,
			relevant_section,
			id
		} 
	});	
	return <Layout>
		<div className="student-list">
			<Title>Students</Title>
			<List 
				items = {[ { Name: "crap", special: true }, ...items]}
				Component = {StudentItem}
				create = {'/student/new'} 
				createText = {"Add new Student"} 
				toLabel = {s => s.Name}
				/> 
		</div>
	</Layout>
}

export default connect(state => {
	return { 
		students: state.db.students,
		classes: state.db.classes
	}
})(StudentList);