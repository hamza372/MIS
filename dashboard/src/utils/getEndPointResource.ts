//@ts-ignore
const END_POINT_URL = window.api_url || "mis-socket.metal.fish"

export const getEndPointResource = ( point:string, school_id: string, start_date: number, end_date: number) => {
	
	const headers = new Headers();

	// @ts-ignore
	headers.set('Authorization', 'Basic ' + btoa(`${window.username}:${window.password}`))

	return fetch(`https://${END_POINT_URL}/dashboard/${point}?school_id=${school_id}&start_date=${start_date}&end_date=${end_date}`, {
		headers
	})
}

export const getEndPointResourceTrial = ( point:string, school_id: string) => {
	
	const headers = new Headers();

	// @ts-ignore
	headers.set('Authorization', 'Basic ' + btoa(`${window.username}:${window.password}`))

	return fetch(`https://${END_POINT_URL}/dashboard/${point}?school_id=${school_id}`, {
		headers
	})
}