import Syncr from '~/src/syncr'
import { MergeAction, DeletesAction, QueueAction, sendServerAction, createLoginSucceed, createMerges, createDeletes } from './core'

export const SELECT_LOCATION = "SELECT_LOCATION"

type Dispatch = (action: any) => any;
type GetState = () => RootBankState

export const createLogin = (username: string, password: string, number: string) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState();

	syncr.send({
		type: "LOGIN",
		client_type: state.auth.client_type,
		client_id: state.client_id,
		id: state.auth.id,
		payload: {
			id: username,
			password
		}
	})
	.then((res: { token: string, sync_state: RootBankState['sync_state'] }) => {

		if (res.sync_state.matches === undefined || Object.keys(res.sync_state.matches).length === 0) {
			dispatch(forceSaveFullStatePotentiallyCausingProblems())
		}

		dispatch(createLoginSucceed(username, res.token, res.sync_state, number))
	})
}

export const forceSaveFullStatePotentiallyCausingProblems = () => (dispatch: Dispatch, getState: GetState) => {
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
	readonly type: "ADD_SCHOOLS"
	schools: { [id: string]: CERPSchool }
}

export const getSchoolProfiles = (school_ids: string[]) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

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

export const reserveMaskedNumber = (school_id: string) => (dispatch: Dispatch, getState: GetState) => {
	// from the pool in state.mask_pairs select an unused number
	const state = getState();

	const free = Object.entries(state.sync_state.mask_pairs)
		.filter(([number, v]) => v.status == "FREE")
		.map(([num,]) => num)

	if (free.length === 0) {
		alert("The Maximum amount of schools are in progress. To continue, you must mark an existing school as done.")
		return;
	}

	const masked_num = free[Math.floor(Math.random() * free.length)]

	const time = new Date().getTime();
	const event: SupplierInteractionEvent = {
		event: "REVEAL_NUMBER",
		time,
		user: {
			number: state.auth.number,
			name: state.sync_state.numbers[state.auth.number].name
		}
	}

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
		},
		{
			path: ["sync_state", "matches", school_id, "history", `${time}`],
			value: event
		}
	]))

}

export const releaseMaskedNumber = (school_id: string) => (dispatch: Dispatch, getState: GetState) => {

	const masked_num = getState().sync_state.matches[school_id].masked_number
	const time = new Date().getTime()
	const state = getState();

	const event: SupplierInteractionEvent = {
		event: "MARK_DONE",
		time,
		user: {
			number: state.auth.number,
			name: state.sync_state.numbers[state.auth.number].name
		}
	}

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
		},
		{
			path: ["sync_state", "matches", school_id, "history", `${time}`],
			value: event
		}
	]))
}

export const saveSchoolRejectedSurvey = (school_id: string, survey: NotInterestedSurvey['meta']) => (dispatch: Dispatch, getState: GetState) => {

	const time = new Date().getTime()

	const state = getState()

	const event : NotInterestedSurvey = {
		event: "MARK_REJECTED_SURVEY",
		meta: survey,
		time,
		user: {
			name: state.sync_state.numbers[state.auth.number].name,
			number: state.auth.number
		}
	}

	dispatch(createMerges([
		{
			path: ["sync_state", "matches", school_id, "history", `${time}`],
			value: event
		}
	]))

}

export const saveSchoolCompletedSurvey = (school_id: string, survey: MarkCompleteSurvey['meta']) => (dispatch: Dispatch, getState: GetState) => {

	const time = new Date().getTime()

	const state = getState()

	const event : MarkCompleteSurvey = {
		event: "MARK_COMPLETE_SURVEY",
		meta: survey,
		time,
		user: {
			name: state.sync_state.numbers[state.auth.number].name,
			number: state.auth.number
		}
	}

	dispatch(createMerges([
		{
			path: ["sync_state", "matches", school_id, "history", `${time}`],
			value: event
		}
	]))
}

export const saveCallEndSurvey = (school_id: string, survey: CallEndSurvey['meta']) => (dispatch: Dispatch, getState: GetState) => {

	const time = new Date().getTime()

	// if no follow up then auto-mark as done?

	const state = getState();

	const event: CallEndSurvey = {
		event: "CALL_END_SURVEY",
		meta: survey,
		time,
		user: {
			name: state.sync_state.numbers[state.auth.number].name,
			number: state.auth.number
		}
	}

	dispatch(createMerges([
		{
			path: ["sync_state", "matches", school_id, "history", `${time}`],
			value: event
		}
	]))

}

export const rejectSchool = (school_id: string) => (dispatch: Dispatch, getState: GetState) => {

	// check if school was in progress... if so we need to release
	// not sure how this could happen so ignoring for now.

	const time = new Date().getTime()

	const state = getState();

	const event: SupplierInteractionEvent = {
		event: "MARK_REJECTED",
		time,
		user: {
			number: state.auth.number,
			name: state.sync_state.numbers[state.auth.number].name
		}
	}

	dispatch(createMerges([
		{
			path: ["sync_state", "matches", school_id, "status"],
			value: "REJECTED"
		},
		{
			path: ["sync_state", "matches", school_id, "history", `${time}`],
			value: event
		}
	]))
}

export const addSupplierNumber = (number: string, name: string) => (dispatch: Dispatch, getState: GetState) => {

	dispatch(createMerges([
		{
			path: ["sync_state", "numbers", number],
			value: {
				name
			}
		}
	]))
}

export const deleteSupplierNumber = (number: string) => (dispatch: Dispatch, getState: GetState) => {
	dispatch(createDeletes([
		{
			path: ["sync_state", "numbers", number]
		}
	]))
}

export type EditLoginNumberAction = ReturnType<typeof editLoginNumber>
export const EDIT_LOGIN_NUMBER = "EDIT_LOGIN_NUMBER"
export const editLoginNumber = (number: string) => ({
	type: EDIT_LOGIN_NUMBER as typeof EDIT_LOGIN_NUMBER,
	number
})

export type Actions = addSchoolAction | MergeAction | DeletesAction | QueueAction;