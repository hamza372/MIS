import * as React from "react"
import Map from '~/src/components/DeckMap'
import Sidebar from '~/src/components/Sidebar'


export default class Home extends React.Component<any, any> {

	constructor(props : any) {
		super(props);

		this.state = {
			selected: undefined
		}
	}

	onSelect = (item : any) => {
		console.log("SELECTED", item)
	}

	render() {
		return <div>
			Hello
			<Map onSelect={item => this.setState({selected: item.object})}/>
			<Sidebar selected={this.state.selected} />
		</div>
	}
}