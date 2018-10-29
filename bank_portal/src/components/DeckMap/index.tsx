import * as React from 'react'
import DeckGL, { ScatterplotLayer } from 'deck.gl'
import { StaticMap } from 'react-map-gl'

import schoolData from '../Map/narrowed.json'

const mapbox_token = "pk.eyJ1IjoidGFpbXVyMzgiLCJhIjoiY2pucWZuY3BtMGZ6dTNxcG53NDh1N3lxZyJ9.795xICQFpWXrTJxF10EJfw"
const mapbox_style_url = "mapbox://styles/taimur38/cjnu7h5pn4jel2rqk4pbo74ke"
//const mapbox_style_url = "mapbox://styles/taimur38/cjnu864ls11xx2rr2i606ili5"

const initialViewState = {
	latitude: 31.582045,
	longitude: 74.329376,
	zoom: 5,
	pitch: 0,
	bearing: 0 
};

class Map extends React.Component {

	render() {

		const data = Object.values(schoolData)
		console.log(data)

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
					getPosition={(d : any) => {
						return [parseFloat(d.GPS_East), parseFloat(d.GPS_North)]
					}}
					getColor={(d: any) => ([255, 140, 0])}
				/>
			</DeckGL>


	}
}

export default Map;