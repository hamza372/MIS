import * as React from 'react'
import ReactMapGL from 'react-map-gl'

const mapbox_token = "pk.eyJ1IjoidGFpbXVyMzgiLCJhIjoiY2pucWZuY3BtMGZ6dTNxcG53NDh1N3lxZyJ9.795xICQFpWXrTJxF10EJfw"
class Map extends React.Component {

	render() {

		return <ReactMapGL
			width={400}
			height={400}
			latitude={31.582045}
			longitude={74.329376}
			zoom={8}
			mapboxApiAccessToken={mapbox_token}
		/>
	}
}

export default Map;