
const END_POINT_URL = "https://mis-socket-dev.metal.fish/dashboard/"

export const getEndPointResource = ( point:string, school_id: string, start_date:string, end_date:string) => {
	return fetch(END_POINT_URL + `${point}?school_id=${school_id}&start_date=${start_date}&end_date=${end_date}`)
}