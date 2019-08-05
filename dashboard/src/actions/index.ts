import Syncr from '../syncr'
import { createLoginSucceed } from './core';

type Dispatch = (action: any) => any
type GetState = () => RootReducerState

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
	.then((res: {token: string, sync_state: SyncState }) => {
		dispatch(createLoginSucceed(username, res.token, res.sync_state ))
	})
	.catch(res => {
		console.error(res)
		alert("login failed" + JSON.stringify(res))
	})

}

export const SCHOOL_INFO = "SCHOOL_INFO"
export const schoolInfo = () => (dispatch: Dispatch) => {

	const headers = new Headers();

	// @ts-ignore
	headers.set('Authorization', 'Basic ' + btoa(`${window.username}:${window.password}`))

	fetch('https://mis-socket.metal.fish/dashboard/school_list', {
		headers
	})
		.then(resp => resp.json())
		.then(resp => {
			dispatch({
				type: SCHOOL_INFO,
				school_list: resp.school_list
			})
		})
		.catch(res => {
			window.alert("Error Fetching List!")
		})

}

export const createSchoolLogin = (username: string, password: string, limit: number, value: SignUpValue) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState();

	syncr.send({
		type:"CREATE_NEW_SCHOOL",
		client_type: state.auth.client_type,
		payload: {
			username,
			password,
			limit,
			value
		}
	})
	.then((res)=> {
		window.alert(`Success\n${JSON.stringify(res)}`)
	})
	.catch(res => {
		console.log("Login Failed", res)
		alert("School Creation Failed !!" + JSON.stringify(res))
	})
}