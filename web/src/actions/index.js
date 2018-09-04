import { hash } from 'utils'
import moment from 'moment'

const SYNC = "SYNC"

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
		type: "SYNC",
		school_id: state.school_id,
		payload: merges.reduce((agg, curr) => {
			return {
				...agg, 
				[curr.path.join(',')]: {
					action: {
						type: "MERGE",
						path: curr.path, 
						value: curr.value
					},
					date: moment().unix() * 1000
				}
			}
		}, {})
	}

	syncr.send(payload)
		.then(dispatch)
		.catch(err => dispatch(QueueUp(action)))
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
		school_id: getState().school_id,
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

export const MERGE_FACULTY = "MERGE_FACULTY"
export const createFacultyMerge = (faculty) => dispatch => {

	dispatch(createMerges([
		{path: ["db", "faculty", faculty.id], value: faculty},
		{path: ["db", "users", faculty.id], value: {
			username: faculty.Username,
			password: faculty.Password,
			type: faculty.Admin ? "admin" : "teacher"
		}}
	]))
}

export const MERGE_STUDENT = "MERGE_STUDENT"
export const createStudentMerge = (student) => dispatch => {

	dispatch(createMerges([
		{path: ["db", "students", student.id], value: student},
	]))
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
				payload: {
					school_id: state.auth.school_id,
					token: state.auth.token,
					client_id: state.client_id
				}
			})
			.then(res => {
				return syncr.send({
					type: SYNC,
					school_id: state.school_id,
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

export const LOCAL_LOGIN = "LOCAL_LOGIN"
export const createLogin = (username, password) => dispatch => {

	hash(password)
		.then(hashed => {
			console.log(hashed)
			dispatch({
				type: LOCAL_LOGIN,
				username,
				password: hashed
			})
		})

}

export const SCHOOL_LOGIN = "SCHOOL_LOGIN"
export const createSchoolLogin = (school_id, password) => (dispatch, getState, syncr) => {

	const action = {
		type: SCHOOL_LOGIN,
		school_id,
		password
	}

	dispatch(action);

	syncr.send({
		type: "LOGIN",
		payload: {
			school_id,
			password,
			client_id: getState().client_id
		}
	})
	.then(res => {
		console.log(res)
		
		dispatch(createLoginSucceed(school_id, res.db, res.token))
	})
	.catch(err => {
		console.error(err)
		dispatch(createLoginFail())
	})
}

export const LOGIN_FAIL = "LOGIN_FAIL"
export const createLoginFail = () => ({ type: LOGIN_FAIL })

export const LOGIN_SUCCEED = "LOGIN_SUCCEED"
export const createLoginSucceed = (school_id, db, token) => ({ type: LOGIN_SUCCEED, school_id, db, token })

