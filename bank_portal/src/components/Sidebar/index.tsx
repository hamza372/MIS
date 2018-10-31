import * as React from 'react'
import { RouteComponentProps } from 'react-router';

import './style.css'

interface propTypes extends RouteComponentProps<any> {
	selected?: {
		SchoolName: string,
		id: string
	}
}

class Sidebar extends React.Component<propTypes, any>{

	constructor(props : propTypes) {
		super(props);

		this.state = {
			school: undefined,
			loading: false
		}
	}

	school_id = () => this.props.match.params.school_id;

	getSchoolData = () => {
		this.setState({ loading: true })
		fetch(`http://localhost:5000/school/${this.school_id()}`)
			.then(res => res.json())
			.then((res : any) => this.setState({ school: res, loading: false }))
			.catch(err => console.error(err))
	}

	componentWillReceiveProps(nextProps : propTypes) {
		this.getSchoolData();
	}

	componentDidMount() {
		this.getSchoolData();
	}

	render() {
		

		if(this.state.school === undefined && !this.state.loading) {
			return false;
		}

		if(this.state.loading) {
			return <div className="sidebar">Loading.....</div>
		}


		const { school } = this.state;
		console.log(school)
		return <div className="sidebar">
			<div className="close" onClick={() => this.setState({school: undefined, loading: false})}>Close</div>
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