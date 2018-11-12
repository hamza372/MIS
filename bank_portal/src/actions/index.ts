import { Dispatch } from "redux";

export const SELECT_LOCATION = "SELECT_LOCATION"
export interface SelectLocationAction {
	type: string,
	loc: SchoolLocation
}

export const selectLocation = (loc : SchoolLocation) => (dispatch: Dispatch, getState: () => RootBankState) => {

	console.log("selecting location", loc.id)

	const state = getState();

	if(state.school_db[loc.id] === undefined) {
		fetch(`https://37c4fcf7.ngrok.io/school/${loc.id}`)
			.then(res => res.json())
			.then((res : School) => dispatch(addToSchoolDB(res)))
			.catch(err => console.error(err))
	}


	dispatch({
		type: SELECT_LOCATION,
		loc: loc
	})
}

export const SET_FILTER = "SET_FILTER"
export interface SetFilterAction {
	type: 'SET_FILTER',
	filter_text: string
}
export const setFilter = (filter_text : string) : SetFilterAction => {

	return {
		type: SET_FILTER,
		filter_text
	}
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