import Syncr from '~/src/syncr'
import { MergeAction, DeletesAction, QueueAction, sendServerAction, createLoginSucceed, createMerges } from './core'

export const SELECT_LOCATION = "SELECT_LOCATION"

type Dispatch = ( action : any) => any;

const debug_url = "http://localhost:5000"
const python_host = process.env.REACT_APP_PORTAL_PYTHON || debug_url;

export const createLogin = (username : string, password : string) => (dispatch: Dispatch, getState: () => RootBankState, syncr: Syncr) => {

	const state = getState();

	syncr.send({
		type: "LOGIN",
		client_type: state.auth.client_type,
		client_id: state.client_id,
		id: state.auth.id,
		payload: {
			id: username, // school_id == username here.
			password
		}
	})
	.then((res : {token: string, sync_state: RootBankState['sync_state']}) => dispatch(createLoginSucceed(username, res.token, res.sync_state)))


}

export interface SelectLocationAction {
	type: string,
	loc: SchoolLocation
}

export const selectLocation = (loc : SchoolLocation) => (dispatch: Dispatch, getState: () => RootBankState) => {

	console.log("selecting location", loc.id)

	const state = getState();

	if(state.school_db[loc.id] === undefined) {
		fetch(`${python_host}/school/${loc.id}`)
			.then(res => res.json())
			.then((res : School) => dispatch(addToSchoolDB(res)))
			.catch(err => console.error(err))
		
		dispatch(sendServerAction({
			type: 'SET_FILTER',
			payload: loc
		}))
	}

	dispatch({
		type: SELECT_LOCATION,
		loc: loc
	})

	dispatch(createMerges([
		{
			path: ["sync_state", "matches", loc.id, "status"],
			value: "NEW"
		}
	]))
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

export type Actions = addSchoolAction | SetFilterAction | SelectLocationAction | MergeAction | DeletesAction | QueueAction;