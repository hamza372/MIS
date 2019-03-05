import * as React from 'react'
import DeckGL, { ScatterplotLayer } from 'deck.gl'
import { StaticMap } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const mapbox_token = "pk.eyJ1IjoidGFpbXVyMzgiLCJhIjoiY2pucWZuY3BtMGZ6dTNxcG53NDh1N3lxZyJ9.795xICQFpWXrTJxF10EJfw"
const mapbox_style_url = "mapbox://styles/taimur38/cjnu7h5pn4jel2rqk4pbo74ke"


interface propTypes {
	onSelect: (item : SchoolLocation) => void,
	school_locations: { [school_id: string]: SchoolLocation }
}

class Map extends React.Component<propTypes, any> {

	constructor(props : propTypes) {
		super(props);

		this.state = {
			viewState: {
				latitude: 31.1704,
				longitude: 72.7097,
				zoom: 5,
				pitch: 0,
				bearing: 0 
			}
		}
	}

	render() {

		const data = Object.entries(this.props.school_locations).map(([id, school]) => ({ id, ...school }))

		return <DeckGL
			initialViewState={this.state.viewState}
			controller={true}
			width="100%"
			height="100%">
				<StaticMap
					mapboxApiAccessToken={mapbox_token} 
					mapStyle={mapbox_style_url}
					width={100}
					height={100}
				/>
				<ScatterplotLayer
					id='schools'
					data={data}
					opacity={0.4}
					radiusScale={90}
					radiusMinPixels={Object.keys(this.props.school_locations).length > 2000 ? 1 : 5}
					radiusMaxPixels={300}
					getPosition={(d : any) => ([parseFloat(d.GPS_East), parseFloat(d.GPS_North)])}
					getColor={(d: any) => ([116, 172, 237])}
					pickable={true}
					onClick={(item : any) => this.props.onSelect(item.object as SchoolLocation)}
					autoHighlight={true}
					highlightColor={[0, 140, 255, 255]}
				/>
			</DeckGL>


	}
}

export default Map;
