
const END_POINT_URL = "http://localhost:8080/dashboard/"

export const getEndPointURL = ( point:string, school_id: string, start_date:string, end_date:string) => {

	return END_POINT_URL + `${point}?school_id=${school_id}&start_date=${start_date}&end_date=${end_date}`
}