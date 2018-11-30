import { Dispatch } from "redux";
import Syncr from '~/src/syncr'

export const SELECT_LOCATION = "SELECT_LOCATION"

export interface SelectLocationAction {
	type: string,
	loc: SchoolLocation
}

const debug_url = "http://localhost:5000/"
const python_host = process.env.REACT_APP_PORTAL_PYTHON || debug_url;

export const selectLocation = (loc : SchoolLocation) => (dispatch: Dispatch, getState: () => RootBankState) => {

	console.log("selecting location", loc.id)

	const state = getState();

	if(state.school_db[loc.id] === undefined) {
		fetch(`${python_host}/school/${loc.id}`)
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
export const setFilter = (filter_text : string) => (dispatch : Dispatch, getState: () => RootBankState, syncr : Syncr) => {

	const state = getState();

	syncr.send({
		type: SET_FILTER,
		client_type: state.auth.client_type,
		id: state.auth.id,
		payload: {
			filter_text
		}
	})
	.then(res => {
		console.log("GOT RESULT", res)
	})
	.catch((err :Error) => console.error(err))

	dispatch({
		type: SET_FILTER,
		filter_text
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

export type Actions = addSchoolAction | SetFilterAction | SelectLocationAction;