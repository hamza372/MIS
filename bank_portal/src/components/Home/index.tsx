import * as React from "react"
import { Route } from 'react-router-dom'
//import Map from '~/src/components/Map'
import Map from '~/src/components/DeckMap'
//import Map from '~/src/components/MapGL'

export default class Home extends React.Component {

	render() {
		return <div>
			Hello

			<Map />
		</div>
	}
}