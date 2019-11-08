
//const END_POINT_URL = "http://localhost:8080/dashboard/"
const END_POINT_URL = "https://mis-socket.metal.fish/dashboard/"

export const getEndPointResource = ( point:string, school_id: string, start_date: number, end_date: number) => {
	
	const headers = new Headers();

	// @ts-ignore
	headers.set('Authorization', 'Basic ' + btoa(`${window.username}:${window.password}`))

	return fetch(`${END_POINT_URL}${point}?school_id=${school_id}&start_date=${start_date}&end_date=${end_date}`, {
		headers
	})
}

export const getEndPointResourceTrial = ( point:string, school_id: string) => {
	
	const headers = new Headers();

	// @ts-ignore
	headers.set('Authorization', 'Basic ' + btoa(`${window.username}:${window.password}`))

	return fetch(`${END_POINT_URL}${point}?school_id=${school_id}`, {
		headers
	})
}