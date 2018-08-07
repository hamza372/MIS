import React, { Component } from 'react'
import Layout from 'components/Layout'

// this page will have all the profile info for a teacher.
// all this data will be editable.

// should come up with reusable form logic. 
// I have an object with a bunch of fields
// text and date input, dropdowns....

export default class SingleTeacher extends Component {

	render() {

		return <Layout>
			<div className="single-teacher">
				NEW TEACHER
				<input type="time" />
			</div>
		</Layout>
	}
}