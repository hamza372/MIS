import { Dispatch } from "redux";

export const SELECT_LOCATION = "SELECT_LOCATION"
export interface SelectLocationAction {
	type: string,
	loc: SchoolLocation
}

export const selectLocation = (loc : SchoolLocation) => (dispatch: Dispatch) => {

	console.log("selecting location", loc.id)

	fetch(`http://localhost:5000/school/${loc.id}`)
		.then(res => res.json())
		.then((res : School) => dispatch(addToSchoolDB(res)))
		.catch(err => console.error(err))

	dispatch({
		type: SELECT_LOCATION,
		loc: loc
	})
}


export const ADD_SCHOOL = "ADD_SCHOOL"
export interface addSchoolAction {
	type: string
	school: School
}

export const addToSchoolDB = (school: School) => {

	return {
		type: ADD_SCHOOL,
		school
	}
}