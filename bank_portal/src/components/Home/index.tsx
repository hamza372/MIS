import * as React from "react"
import Map from '~/src/components/DeckMap'
import { withRouter, Route, RouteComponentProps } from 'react-router-dom'
import Sidebar from '~/src/components/Sidebar'


class Home extends React.Component<RouteComponentProps<any>, any> {

	constructor(props : any) {
		super(props);

		this.state = {
			selected: undefined
		}
	}

	onSelect = (item : any) => {
		console.log("SELECTED", item)

		this.props.history.push(`/school/${item.object.id}`);
	}

	render() {
		return <div>
			Hello
			<Map onSelect={this.onSelect}/>
			<Route path="/school/:school_id" component={Sidebar} />
		</div>
	}
}

export default withRouter(Home);