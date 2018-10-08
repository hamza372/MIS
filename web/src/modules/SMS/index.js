import React, { Component } from 'react'
import { connect } from 'react-redux'

import Layout from 'components/Layout'

class SMS extends Component {

	render() {
		return <Layout>
			<div className="sms-page">
				Hello
			</div>
		</Layout>
	}
}

export default connect(state => ({ sms_templates: state.db.sms_templates }))(SMS);