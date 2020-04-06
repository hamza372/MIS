import Syncr from '@cerp/syncr'
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
		.then((res: { token: string, sync_state: SyncState }) => {
			dispatch(createLoginSucceed(username, res.token, res.sync_state))
		})
		.catch(res => {
			console.error(res)
			alert("login failed" + JSON.stringify(res))
		})

}