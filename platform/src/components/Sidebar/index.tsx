import * as React from 'react'
import { RouteComponentProps } from 'react-router';

import './style.css'

interface propTypes {
	school?: PMIUSchool,
}

class Sidebar extends React.Component<propTypes, any>{

	constructor(props : propTypes) {
		super(props);
		this.state = {
			hide: false
		}
	}


	componentWillReceiveProps(nextProps : propTypes) {
		this.setState({
			hide: false
		})
	}

	render() {

		const { school } = this.props;

		if(school === undefined) {
			return <div className="sidebar">Loading....</div>
		}

		if(this.state.hide) {
			return false;
		}

		return <div className="sidebar">
			<div className="close" onClick={() => this.setState({ hide: true })}>Close</div>
			<div className="title">{school.SchoolName}</div>
			{
				Object.entries(school)
					.filter(([k, v]) => v !== undefined && v !== "")
					.map(([k, v]) => <div key={k}><b>{k}</b>: {v}</div>)
			}
		</div>
	}

}

export default Sidebar;