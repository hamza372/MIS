import * as moment from 'moment'
import { Dispatch } from 'redux';

const SYNC = "SYNC"

// TODO: separate out connect, auth merges and deletes into separate folder
export const MERGES = "MERGES"
export interface Merge { path: Array<string>, value: any }
export const createMerges= (merges : Array<Merge>) => (dispatch : Function, getState : Function, syncr) => {
	// merges is a list of path, value

	const action = {
		type: MERGES,
		merges
	}

	dispatch(action)

	const state = getState();
	const payload = {
		type: "SYNC",
		school_id: state.auth.school_id,
		payload: merges.reduce((agg : Object, curr) => ({
			...agg, 
			[curr.path.join(',')]: {
				action: {
					type: "MERGE",
					path: curr.path.map(p => p === undefined ? "" : p),
					value: curr.value
				},
				date: moment().unix() * 1000
			}
		}), {})
	}

	// payload is an object of [path]: { action: {type, path, value}, date: timestamp }

	syncr.send(payload)
		.then(dispatch)
		.catch((err : Error) => dispatch(QueueUp(payload.payload)))
}

export const SMS = "SMS"
export const sendSMS = (text : string, number : string) => (dispatch : Function, getState : Function, syncr) => {
	
	// should i keep a log of all messages sent in the db?

	syncr.send({
		type: SMS,
		school_id: getState().auth.school_id,
		payload: {
			text,
			number,
		}
	})
	.then(dispatch)
	.catch((err : Error) => console.error(err)) // this should backup to sending the sms via the android app?

}

export const BATCH_SMS = "BATCH_SMS"
export interface TextMessage { text: string, number: string }
export const sendBatchSMS = (messages : Array<TextMessage>) => (dispatch : Function, getState : Function, syncr) => {

	syncr.send({
		type: BATCH_SMS,
		school_id: getState().auth.school_id,
		payload: {
			messages: messages.map(m => ({
				text: m.text,
				number: m.number // only doing this for documentation purposes
			}))
		}
	})
	.catch((err : Error) => {
		console.error(err) // send via android app?
	})
}

export const DELETES = "DELETES"
export interface Delete { path: Array<string> }
export const createDeletes = (paths : Array<Delete>) => (dispatch : Function, getState : Function, syncr) => {

	const action = {
		type: DELETES,
		paths
	}

	dispatch(action)
	const payload = paths.reduce((agg, curr) => ({
			...agg, 
			[curr.path.join(',')]: {
				action: {
					type: "DELETE",
					path: curr.path.map(x => x === undefined ? "" : x),
					value: 1
				},
				date: moment().unix() * 1000
			}
		}), {})

	syncr.send({
		type: SYNC,
		school_id: getState().auth.school_id,
		payload 
	})
	.then(dispatch)
	.catch((err : Error) => dispatch(QueueUp(payload)))

}

export const DELETE = "DELETE"
export const createDelete = (path : Array<string>) => (dispatch : Function, getState : Function, syncr) => {

	const action = {
		type: DELETE,
		path
	}

	// apply the merge locally
	dispatch(action);

	// attempt to send it
	syncr.send({
		type: SYNC,
		school_id: getState().auth.school_id,
		payload: {
			[path.join(',')]: {
				action,
				date: moment().unix() * 1000
			}
		}
	})
	.then(dispatch)
	.catch((err : Error) => dispatch(QueueUp(action)))
}

// this is only produced by the server. 
// it will tell us it hsa confirmed sync up to { date: timestamp }
export const CONFIRM_SYNC = "CONFIRM_SYNC"
export const SNAPSHOT = "SNAPSHOT"

export const QUEUE = "QUEUE"
	// payload is an object of [path]: { action: {type, path, value}, date: timestamp }
export interface QueuedAction { 
	type: string,
	path: Array<string>,
	value: any
}

export const QueueUp = (action) => {
	return {
		type: QUEUE,
		payload: action
	}
}

export const ON_CONNECT = "ON_CONNECT"
export const ON_DISCONNECT = "ON_DISCONNECT"
export const connected = () => (dispatch : Dispatch, getState, syncr) => { 
	const action = {type: ON_CONNECT}

	dispatch(action)

	const state = getState();

	if(state.auth.school_id && state.auth.token) {
		syncr
			.send({
				type: "VERIFY",
				payload: {
					school_id: state.auth.school_id,
					token: state.auth.token,
					client_id: state.client_id
				}
			})
			.then(res => {
				return syncr.send({
					type: SYNC,
					school_id: state.auth.school_id,
					payload: state.queued
				})
			})
			.then(resp => {
				dispatch(resp)
			})
			.catch(err => {
				console.error(err)
			})
	}
}

export const disconnected = () => ({ type: ON_DISCONNECT })

export const LOGIN_FAIL = "LOGIN_FAIL"
export const createLoginFail = () => ({ type: LOGIN_FAIL })

export const LOGIN_SUCCEED = "LOGIN_SUCCEED"
export const createLoginSucceed = (school_id, db, token) => ({ type: LOGIN_SUCCEED, school_id, db, token })
