import Syncr from '~/src/syncr'
import { MergeAction, DeletesAction, QueueAction, sendServerAction, createLoginSucceed, createMerges, createDeletes } from './core'

export const SELECT_LOCATION = "SELECT_LOCATION"

type Dispatch = ( action : any) => any;
type GetState = () => RootBankState

const debug_url = "http://localhost:5000"
const python_host = process.env.REACT_APP_PORTAL_PYTHON || debug_url;

export const createLogin = (username : string, password : string) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

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

export const forceSaveFullStatePotentiallyCausingProblems = () => (dispatch : Dispatch, getState: GetState) => {
	const state = getState();

	dispatch(createMerges([
		{
			path: ["sync_state"],
			value: state.sync_state
		}
	]))
}

export const ADD_SCHOOLS = "ADD_SCHOOLS"
export interface addNewSchoolAction {
	type: string
	schools: { [id: string] : CERPSchool }
}


export const getSchoolProfiles = (school_ids : string[]) => (dispatch : Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState();

	syncr.send({
		type: "GET_SCHOOL_PROFILES",
		client_type: state.auth.client_type,
		client_id: state.auth.id,
		id: state.auth.id,
		payload: {
			school_ids
		}
	})
	.then(res => {
		console.log(res);
		dispatch({
			type: ADD_SCHOOLS,
			schools: res,
		})

		return res;
	})
	.catch(err => {
		console.error(err);

		setTimeout(() => dispatch(getSchoolProfiles(school_ids)), 1000)
	})
}

export const selectLocation = (loc : SchoolLocation) => (dispatch: Dispatch, getState: GetState) => {

	console.log("selecting location", loc.id)

	const state = getState();

	if(state.school_db[loc.id] === undefined) {
		fetch(`${python_host}/school/${loc.id}`)
			.then(res => res.json())
			.then((res : PMIUSchool) => dispatch(addToSchoolDB(res)))
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
export const setFilter = (filter_text : string) => (dispatch : Dispatch, getState: GetState, syncr : Syncr) => {

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
	school: PMIUSchool
}

export const addToSchoolDB = (school: PMIUSchool) => {

	return {
		type: ADD_SCHOOL,
		school
	}
}

export const reserveMaskedNumber = (school_id : string) => (dispatch: Dispatch, getState: GetState) => {
	// from the pool in state.mask_pairs select an unused number
	const state = getState();

	const free = Object.entries(state.sync_state.mask_pairs)
		.filter(([number, v]) => v.status == "FREE")
		.map(([num, ]) => num)
	
	if(free.length === 0) {
		alert("The Maximum amount of schools are in progress. To continue, you must mark an existing school as done.")
		return;
	}

	const masked_num = free[Math.floor(Math.random() * free.length)]

	dispatch(createMerges([
		{
			path: ["sync_state", "mask_pairs", masked_num],
			value: {
				status: "USED",
				school_id
			}
		},
		{
			path: ["sync_state", "matches", school_id, "masked_number"],
			value: masked_num
		},
		{
			path: ["sync_state", "matches", school_id, "status"],
			value: "IN_PROGRESS"
		}
	]))

}

export const releaseMaskedNumber = (school_id : string) => (dispatch: Dispatch, getState: GetState) => {

	const masked_num = getState().sync_state.matches[school_id].masked_number

	dispatch(createMerges([
		{
			path: ["sync_state", "mask_pairs", masked_num],
			value: {
				status: "FREE"
			}
		},
		{
			path: ["sync_state", "matches", school_id, "status"],
			value: "DONE"
		},
		{
			path: ["sync_state", "matches", school_id, "masked_number"],
			value: ""
		}
	]))
}

export const addSupplierNumber = (number : string, name: string) => (dispatch: Dispatch, getState: GetState) => {

	dispatch(createMerges([
		{
			path: ["sync_state", "numbers", number],
			value: {
				name
			}
		}
	]))
}

export const deleteSupplierNumber = (number : string) => (dispatch: Dispatch, getState: GetState) => {
	dispatch(createDeletes([
		{
			path: ["sync_state", "numbers", number]
		}
	]))
}

export type Actions = addSchoolAction | SetFilterAction | SelectLocationAction | MergeAction | DeletesAction | QueueAction;