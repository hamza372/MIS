import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import {getSectionsFromClasses} from 'utils/getSectionsFromClasses';
import Layout from 'components/Layout'
import Former from '../../utils/former';

class Reports extends Component {

	constructor(props) {
		super(props)
	
		this.state = {
			enterBy: "BULK",
			filterText: ""
		}

		this.former = new Former(this,[])
	}

	render() {

		const sections = getSectionsFromClasses(this.props.classes)
			.filter(s => this.state.filterText === "" ? true: s.namespaced_name.toLowerCase().includes(this.state.filterText.toLowerCase()) )
		
		return <Layout history={this.props.history}>
			<div className="reports-page">
				<div className="title">Sections</div>
				<div className="form" style={{width: "90%"}}>
					<div className="row">
						<label>Marks By</label>
						<select {...this.former.super_handle(["enterBy"])}>
							<option value="SINGLE">Single Exam</option>
							<option value="BULK">Class Exam </option>
						</select>
					</div>
				</div>

				<input className="list-wrap search-bar" style={{width:"90%"}} placeholder="Search" {...this.former.super_handle(["filterText"])} type="text"/>
				
				<div className="list" style={{ paddingLeft: "2px" }}>
				{
					sections
					   .sort((a, b) => (a.classYear || 0) - (b.classYear || 0))
					   .map(s => <Link to={`/reports/${s.class_id}/${s.id}/${this.state.enterBy === "BULK" ? "bulk": ""}`} key={s.id}>{s.namespaced_name}</Link>)
				}
				</div>
			</div>
		</Layout>

	}
} 

export default connect(state => ({
	classes: state.db.classes
}))(Reports)
