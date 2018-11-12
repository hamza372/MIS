import moment from 'moment'

const SYNC = "SYNC"
const client_type = "mis";

// TODO: separate out connect, auth merges and deletes into separate folder
export const MERGES = "MERGES"
export const createMerges= (merges) => (dispatch, getState, syncr) => {
	// merges is a list of path, value

	const action = {
		type: MERGES,
		merges
	}

	dispatch(action)

	const state = getState();
	const payload = {
		type: SYNC,
		school_id: state.auth.school_id,
		client_type,
		lastSnapshot: state.lastSnapshot,
		payload: merges.reduce((agg, curr) => ({
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

	syncr.send(payload)
		.then(dispatch)
		.catch(err => dispatch(QueueUp(payload.payload)))
}

export const SMS = "SMS"
export const sendSMS = (text, number) => (dispatch, getState, syncr) => {
	
	// should i keep a log of all messages sent in the db?

	syncr.send({
		type: SMS,
		client_type,
		school_id: getState().auth.school_id,
		payload: {
			text,
			number,
		}
	})
	.then(dispatch)
	.catch(err => console.error(err)) // this should backup to sending the sms via the android app?

}

export const BATCH_SMS = "BATCH_SMS"
export const sendBatchSMS = (messages) => (dispatch, getState, syncr) => {

	syncr.send({
		type: BATCH_SMS,
		client_type,
		school_id: getState().auth.school_id,
		payload: {
			messages: messages.map(m => ({
				text: m.text,
				number: m.number // only doing this for documentation purposes
			}))
		}
	})
	.catch(err => {
		console.error(err) // send via android app?
	})
}

export const DELETES = "DELETES"
export const createDeletes = (paths) => (dispatch, getState, syncr) => {

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

	const state = getState();
	syncr.send({
		type: SYNC,
		client_type,
		school_id: state.auth.school_id,
		lastSnapshot: state.lastSnapshot,
		payload 
	})
	.then(dispatch)
	.catch(err => dispatch(QueueUp(payload)))

}

export const DELETE = "DELETE"
export const createDelete = (path) => (dispatch, getState, syncr) => {
	const action = {
		type: DELETE,
		path
	}

	// apply the merge locally
	dispatch(action);

	// attempt to send it
	syncr.send({
		type: SYNC,
		client_type,
		school_id: getState().auth.school_id,
		payload: {
			[path]: {
				action,
				date: moment().unix() * 1000
			}
		}
	})
	.then(dispatch)
	.catch(err => dispatch(QueueUp(action)))
}

// this is only produced by the server. 
// it will tell us it hsa confirmed sync up to { date: timestamp }
export const CONFIRM_SYNC = "CONFIRM_SYNC"
export const SNAPSHOT = "SNAPSHOT"

export const QUEUE = "QUEUE"
export const QueueUp = (action) => {
	return {
		type: QUEUE,
		payload: action
	}
}

export const ON_CONNECT = "ON_CONNECT"
export const ON_DISCONNECT = "ON_DISCONNECT"
export const connected = () => (dispatch, getState, syncr) => { 
	const action = {type: ON_CONNECT}

	dispatch(action)

	const state = getState();

	if(state.auth.school_id && state.auth.token) {
		syncr
			.send({
				type: "VERIFY",
				client_type,
				payload: {
					school_id: state.auth.school_id,
					token: state.auth.token,
					client_id: state.client_id
				}
			})
			.then(res => {
				return syncr.send({
					type: SYNC,
					client_type,
					school_id: state.auth.school_id,
					payload: state.queued,
					lastSnapshot: state.lastSnapshot
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