import * as React from 'react'

import './style.css'

interface propTypes {
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

	componentWillReceiveProps(nextProps : propTypes) {

		if(nextProps.selected) {

			this.setState({ loading: true })
			fetch(`http://localhost:5000/school/${nextProps.selected.id}`)
				.then(res => res.json())
				.then((res : any) => this.setState({ school: res, loading: false }))
				.catch(err => console.error(err))
		}
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