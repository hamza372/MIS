import * as React from "react"
import GoogleMapReact from 'google-map-react'

import schoolData from './narrowed.json'

export default class Map extends React.Component {

	render() {

		console.log(Object.values(schoolData).length)
		/*
		Object.values(schoolData)
			.map((s : any) => <div lat={s.GPS_North} lng={s.GPS_East}>
				X
			</div>)
		*/

		return <div className="map" style={{height: '100vh', width: '100%'}}>
			<GoogleMapReact bootstrapURLKeys={{
				key: "AIzaSyAt3L3I1mEjgPLLOOhr-Alv-exSTXDX6uo"
			}}
			defaultCenter={{lat: 31.582045,lng: 74.329376}}
			defaultZoom={5}
			yesIWantToUseGoogleMapApiInternals={true}
			options={m => ({
				mapTypeId: m.MapTypeId.ROADMAP
			})}
			>
			</GoogleMapReact>

		</div>
	}

}