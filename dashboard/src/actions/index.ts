import Syncr from '@cerp/syncr'
import { createLoginSucceed } from './core';
import moment from 'moment';

type Dispatch = (action: any) => any
type GetState = () => RootReducerState

type permissionPayload = {
	role: string;
	permissions: UserPermissions
}

export const createUser = ( name: string, password: string, permissions: permissionPayload) => ( dispatch: Dispatch, getState: GetState, syncr: Syncr) => {
	const state = getState();
	
	syncr.send({
		type: "CREATE_USER",
		client_type: state.auth.client_type,
		client_id: state.client_id,
		payload: {
			name: name,
			password,
			permissions
		}
	})
	.then((res: any) => {
		window.alert(res)
	})
	.catch(res => {
		alert("create user failed" + JSON.stringify(res))
	})
}

export const createLogin = (username: string, password: string) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState();

	syncr.send({
		type: "LOGIN",
		client_type: state.auth.client_type,
		client_id: state.client_id,
		payload: {
			id: username,
			password
		}
	})
	.then((res: { id: string, token: string, permissions: permissionPayload }) => {
		syncr.verify()
		dispatch(createLoginSucceed( res.id, res.token, res.permissions.role, res.permissions.permissions))
	})
	.catch(res => {
		console.error(res)
		alert("login failed" + JSON.stringify(res))
	})

}

export const SCHOOL_LIST = "SCHOOL_LIST"
export const getSchoolList = () => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState()

	if (!syncr.connection_verified) {
		syncr.onNext("verify", () => dispatch(getSchoolList()))
		return
	}

	syncr.send({
		type: "SCHOOL_LIST",
		client_type: state.auth.client_type,
		client_id: state.client_id,
		payload: {
			id: state.auth.id
		}
	})
	.then((res: { school_list: string[]}) => {
		dispatch({
			type: SCHOOL_LIST,
			school_list: res.school_list
		})
	})
	.catch(err => {
		window.alert("Error Fetching List!")
	})
}

export const SCHOOL_INFO = "SCHOOL_INFO"
export const getSchoolInfo = (school_id: string) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {

	const state = getState()

	if (!syncr.connection_verified) {
		syncr.onNext("verify", () => dispatch(getSchoolInfo( school_id )))
		return
	}

	syncr.send({
		type: "GET_SCHOOL_INFO",
		client_type: state.auth.client_type,
		client_id: state.client_id,
		payload: {
			school_id
		}
	})
	.then((res: { trial_info: any, student_info: any, meta: TrialsDataRow["value"] }) => {
		dispatch({
			type: SCHOOL_INFO,
			trial_info: res.trial_info,
			student_info: res.student_info,
			meta: res.meta
		})
	})
	.catch(err => {
		window.alert("Error Fetching List!")
	})
}

export const updateSchoolInfo = (school_id: string, student_limit: number, paid: boolean, date: number) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {
	const state = getState();

	const merges = [
		{
			"db,package_info": {
				"date": moment.now(),
				"action": {
					"path": ["db", "package_info"],
					"type": "MERGE",
					"value": {
						"paid": paid,
						"trial_period": 15,
						"date": date
					}
				}
			}
		},
		{
			"db,max_limit": {
				"date": moment.now(),
				"action": {
					"path": ["db", "max_limit"],
					"type": "MERGE",
					"value": student_limit
				}
			}
		
		}
	]

	syncr.send({
		type: "UPDATE_SCHOOL_INFO",
		client_type: state.auth.client_type,
		client_id: state.client_id,
		id: state.auth.id,
		payload: {
			school_id,
			merges,
			paid
		}
	})
	.then((res: {token: string, sync_state: SyncState }) => {
		alert(res)
		getSchoolInfo(school_id)
	})
	.catch(res => {
		console.error(res)
		alert("School Info Update Fail" + JSON.stringify(res))
	})
}

export const REFERRALS_INFO = "REFERRALS_INFO"
export const getReferralsInfo = () => ( dispatch: Dispatch, getState: GetState, syncr: Syncr) => {
	
	const state = getState()

	if (!syncr.connection_verified) {
		syncr.onNext("verify", () => dispatch(getReferralsInfo()))
		return
	}

	syncr.send({
		type: "GET_REFERRALS_INFO",
		client_type: state.auth.client_type,
		client_id: state.client_id,
		payload: {
			id: state.auth.id
		}
	})
	.then((res: { referrals: any}) => {
		dispatch({
			type: REFERRALS_INFO,
			trials: res.referrals
		})
	})
	.catch( (err: any) => {
		window.alert(`Error Fetching Trial Information!\n${err}`)
	})
}

export const updateReferralInformation = (school_id: string, value: any) => (dispatch: Dispatch, getState: GetState, syncr: Syncr) => {
	
	const state = getState();

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
			value,
			role: state.auth.role
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

export const getEndPointResource = ( point: string, school_id: string, start_date: number, end_date: number) => ( dispatch: Dispatch, getState: GetState,  syncr: Syncr) => {

	const state = getState()

	if (!syncr.connection_verified) {
		syncr.onNext("verify", () => dispatch(getEndPointResource(point, school_id, start_date, end_date)))
		return
	}

	syncr.send({
		type: point,
		client_type: state.auth.client_type,
		client_id: state.client_id,
		payload: {
			school_id,
			start_date,
			end_date
		}
	})
	.then(res => {
		dispatch({
			type: point,
			payload: res
		})
	})
	.catch(err => {
		console.error(`Error Getting ${point}-Resource`)
	})
}