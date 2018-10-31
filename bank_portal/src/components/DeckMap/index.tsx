import * as React from 'react'
import DeckGL, { ScatterplotLayer } from 'deck.gl'
import { StaticMap } from 'react-map-gl'

import schoolData from './narrowed.json'

const mapbox_token = "pk.eyJ1IjoidGFpbXVyMzgiLCJhIjoiY2pucWZuY3BtMGZ6dTNxcG53NDh1N3lxZyJ9.795xICQFpWXrTJxF10EJfw"
const mapbox_style_url = "mapbox://styles/taimur38/cjnu7h5pn4jel2rqk4pbo74ke"


interface propTypes {
	onSelect: (item : any) => void
}

const initialViewState = {
	latitude: 31.1704,
	longitude: 72.7097,
	zoom: 6,
	pitch: 0,
	bearing: 0 
};

class Map extends React.Component<propTypes, any> {

	constructor(props : propTypes) {
		super(props);
	}

	render() {

		const data = Object.entries(schoolData).map(([id, school]) => ({ id, ...school }))

		return <DeckGL
			initialViewState={initialViewState}
			controller={true}
			width="100%"
			height="100%">
				<StaticMap
					mapboxApiAccessToken={mapbox_token} 
					mapStyle={mapbox_style_url}
				/>
				<ScatterplotLayer
					id='schools'
					data={data}
					opacity={0.4}
					radiusScale={90}
					radiusMinPixels={1}
					radiusMaxPixels={300}
					getPosition={(d : any) => ([parseFloat(d.GPS_East), parseFloat(d.GPS_North)])}
					getColor={(d: any) => ([255, 140, 0])}
					pickable={true}
					onClick={(item : any) => this.props.onSelect(item)}
					autoHighlight={true}
					highlightColor={[0, 140, 255, 255]}
				/>
			</DeckGL>


	}
}

export default Map;
