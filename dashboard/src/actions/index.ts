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

export const createSchoolLogin = (username: string, password: string, limit: number, package_name: string, agent_name: string, agent_type: string, agent_city: string, notes: string) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState();

	syncr.send({
		type:"CREATE_NEW_SCHOOL",
		client_type: state.auth.client_type,
		payload: {
			username,
			password,
			limit,
			package_name,
			agent_name,
			agent_type,
			agent_city,
			notes
			
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