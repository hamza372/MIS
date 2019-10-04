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
	const END_POINT_URL = "https://mis-socket.metal.fish/dashboard"

	fetch(`${END_POINT_URL}/school_list`, {
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

export const REFERRALS_INFO = "REFERRALS_INFO"
export const getReferralsInfo = () => ( dispatch: Dispatch) => {
	
	const headers = new Headers();

	const END_POINT_URL = "https://mis-socket.metal.fish/dashboard"
	//@ts-ignore
	headers.set('Authorization', 'Basic ' + btoa(`${window.username}:${window.password}`))

	fetch(`${END_POINT_URL}/referrals`, {
		headers
	})
		.then(resp => resp.json())
		.then(resp => {
			console.log("FETCHED INFO", resp.referrals)
			dispatch({
				type: REFERRALS_INFO,
				trials: resp.referrals
			})
		})
		.catch(err => {
			window.alert(`Error Fetching Trial Information!\n${err}`)
		})
}

export const updateReferralInformation = (school_id: string, value: any) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {
	
	const state = getState();

	console.log("In Update action")

	syncr.send({
		type: "UPDATE_REFERRALS_INFO",
		client_type: state.auth.client_type,
		payload: {
			school_id,
			value
		}
	})
	.then((res) => {
		window.alert(`Update Successful\n${res}`)
		getReferralsInfo()
	})
	.catch(() => {
		window.alert(`Update Information Failed for school ${school_id}`)
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