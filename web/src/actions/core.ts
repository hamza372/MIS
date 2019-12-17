import { Dispatch } from 'redux'
import Syncr from 'syncr';
import { loadDb } from 'utils/indexedDb';
import { v4 } from 'node-uuid';

const SYNC = "SYNC"
const client_type = "mis";

// TODO: separate out connect, auth merges and deletes into separate folder
export const MERGES = "MERGES"

interface Merge {
	path: string[];
	value: any;
}

export interface MergeAction {
	type: "MERGES";
	merges: Merge[];
}

export const analyticsEvent = (event: BaseAnalyticsEvent[]) => (dispatch: Function, getState: () => RootReducerState, syncr: Syncr) => {

	const event_payload = event.reduce((agg, curr) => {
		return {
			...agg,
			[v4()]: {
				type: curr.type,
				meta: curr.meta,
				time: new Date().getTime()
			} as RouteAnalyticsEvent
		}
	}, {} as { [id: string]: RouteAnalyticsEvent })

	const state = getState();
	const rationalized_event_payload = {
		...state.queued,
		analytics: {
			...state.queued.analytics,
			...event_payload
		}
	}

	const payload = {
		type: SYNC,
		school_id: state.auth.school_id,
		client_type: client_type,
		lastSnapshot: state.lastSnapshot,
		payload: rationalized_event_payload
	}

	dispatch(QueueAnalytics(event_payload))

	syncr.send(payload)
		.then(res => {
			dispatch(multiAction(res))
		})
		.catch(err => {
			dispatch(QueueAnalytics(event_payload))

			if (state.connected && err !== "timeout") {
				alert("Syncing Error: " + err)
			}
		})
}

export const createMerges= (merges: Merge[]) => (dispatch: (a: any) => any, getState: () => RootReducerState, syncr: Syncr) => {
	// merges is a list of path, value

	const action = {
		type: MERGES,
		merges
	}

	dispatch(action)

	const new_merges = merges.reduce((agg, curr) => ({
		...agg,
		[curr.path.join(',')]: {
			action: {
				type: "MERGE",
				path: curr.path.map(p => p === undefined ? "" : p),
				value: curr.value
			},
			date: new Date().getTime()
		}
	}), {})

	const state = getState();
	const rationalized_merges = {
		...state.queued,
		mutations: {
			...state.queued.mutations,
			...new_merges
		}
	}

	const payload = {
		type: SYNC,
		school_id: state.auth.school_id,
		client_type: client_type,
		lastSnapshot: state.lastSnapshot,
		payload: rationalized_merges
	}

	dispatch(QueueMutations(new_merges))

	syncr.send(payload)
		.then(res => {
			dispatch(multiAction(res))
		})
		.catch(err => {
			dispatch(QueueMutations(new_merges))
			
			if( state.connected && err !== "timeout") {
				alert("Syncing Error: " + err)
			}
		})
}

export const SMS = "SMS"
export const sendSMS = (text: string, number: string) => (dispatch: (a: any) => any, getState: () => RootReducerState, syncr: Syncr) => {

	// should i keep a log of all messages sent in the db?

	const state = getState();
	syncr.send({
		type: SMS,
		client_type: client_type,
		school_id: state.auth.school_id,
		payload: {
			text,
			number,
		}
	})
	.then(dispatch)
	.catch((err: Error) => console.error(err)) // this should backup to sending the sms via the android app?
}


export const BATCH_SMS = "BATCH_SMS"
interface SMS {
	text: string;
	number: string;
}

export const sendBatchSMS = (messages: SMS[]) => (dispatch: (a: any) => any, getState: () => RootReducerState, syncr: Syncr) => {

	const state = getState();
	syncr.send({
		type: BATCH_SMS,
		client_type: client_type,
		school_id: state.auth.school_id,
		payload: {
			messages
		}
	})
	.catch((err: Error) => {
		console.error(err) // send via android app?
	})
}

interface ServerAction {
	type: string;
	payload: any;
}

export const sendServerAction = ( action: ServerAction ) => (dispatch: Dispatch, getState: () => RootReducerState, syncr: Syncr) => {
	const state = getState();

	console.log('send server action...', action)
	return syncr.send({
		type: action.type,
		client_type: client_type,
		client_id: state.client_id,
		school_id: state.auth.school_id,
		payload: action.payload
	})
	.then(dispatch)
	.catch((err: Error) => {
		console.error(err)
	})

	// should it get queued up....
}

export const DELETES = "DELETES"
interface Delete {
	path: string[];
}

export interface DeletesAction {
	type: "DELETES";
	paths: Delete[];
}

export const createDeletes = (paths: Delete[]) => (dispatch: Function, getState: () => RootReducerState, syncr: Syncr) => {

	const action = {
		type: DELETES,
		paths
	}

	dispatch(action)

	const state = getState();
	const payload = paths.reduce((agg, curr) => ({
			...agg, 
			[curr.path.join(',')]: {
				action: {
					type: "DELETE",
					path: curr.path.map(x => x === undefined ? "" : x),
					value: 1
				},
				date: new Date().getTime()
			}
		}), {})
	
	const rationalized_deletes = {
		...state.queued,
		mutations: {
			...state.queued.mutations,
			...payload
		}
	}

	dispatch(QueueMutations(payload))

	syncr.send({
		type: SYNC,
		client_type: client_type,
		school_id: state.auth.school_id,
		lastSnapshot: state.lastSnapshot,
		payload: rationalized_deletes
	})
	.then(res => {
		dispatch(multiAction(res))
	})
	.catch(err => {

		dispatch(QueueMutations(payload))

		if( state.connected && err !== "timeout") {
			alert("Syncing Error: " + err)
		}
	})

}

// this is only produced by the server. 
// it will tell us it hsa confirmed sync up to { date: timestamp }
export const CONFIRM_SYNC = "CONFIRM_SYNC"
export const CONFIRM_SYNC_DIFF = "CONFIRM_SYNC_DIFF"
export interface ConfirmSyncAction {
	type: "CONFIRM_SYNC_DIFF";
	date: number;
	new_writes: Write[];
}

export interface Write {
	date: number;
	value: any;
	path: string[];
	type: "MERGE" | "DELETE";
	client_id: string;
}

export const SNAPSHOT = "SNAPSHOT"
export const SNAPSHOT_DIFF = "SNAPSHOT_DIFF"

export interface SnapshotDiffAction {
	new_writes: {
		[path_string: string]: {
			type: "MERGE" | "DELETE";
			path: string[];
			value?: any;
		};
	};
}

export const QUEUE = "QUEUE"
// queue up an object where key is path, value is action/date
interface MutationsQueueable { 
	[path: string]: {
		action: {
			type: "MERGE" | "DELETE";
			path: string[];
			value?: any;
		};
		date: number;
	};
}

interface AnalyticsQueuable { 
	[path: string]: RouteAnalyticsEvent;
}

interface BaseQueueAction {
	type: "QUEUE";
	queue_type: string;
}

export interface QueueAnalyticsAction extends BaseQueueAction {
	queue_type: "analytics";
	payload: AnalyticsQueuable;
}

export interface QueueMutationsAction extends BaseQueueAction {
	queue_type: "mutations";
	payload: MutationsQueueable;
}
export type QueueAction = QueueMutationsAction | QueueAnalyticsAction

export interface ConfirmAnalyticsSyncAction {
	type: "CONFIRM_ANALYTICS_SYNC";
	time: number
}

export const QueueMutations = (action: MutationsQueueable ) : QueueMutationsAction => {
	return {
		type: QUEUE,
		payload: action,
		queue_type: "mutations"
	}
}

export const QueueAnalytics = (action: AnalyticsQueuable ) : QueueAnalyticsAction => {
	return {
		type: QUEUE,
		payload: action,
		queue_type: "analytics"
	}
}

export const ON_CONNECT = "ON_CONNECT"
export const ON_DISCONNECT = "ON_DISCONNECT"
export const connected = () => (dispatch: (a: any) => any, getState: () => RootReducerState, syncr: Syncr) => { 
	const action = {type: ON_CONNECT}

	dispatch(action)

	const state = getState();

	if(state.auth.school_id && state.auth.token) {
		syncr
			.send({
				type: "VERIFY",
				client_type: client_type,
				payload: {
					school_id: state.auth.school_id,
					token: state.auth.token,
					client_id: state.client_id,
				}
			})
			.then(res => {
				return syncr.send({
					type: SYNC,
					client_type: client_type,
					school_id: state.auth.school_id,
					payload: state.queued,
					lastSnapshot: state.lastSnapshot
				})
			})
			.then(resp => dispatch(multiAction(resp)))
			.catch(err => {
				console.error(err)
				alert("Authorization Failed. Log out and Log in again.")
			})
	}
}

export const disconnected = () => ({ type: ON_DISCONNECT })

export const LOGIN_FAIL = "LOGIN_FAIL"
export const createLoginFail = () => ({ type: LOGIN_FAIL })

export const LOGIN_SUCCEED = "LOGIN_SUCCEED"
export interface LoginSucceed {
	type: "LOGIN_SUCCEED";
	school_id: string;
	token: string;
	db: RootReducerState['db'];
}
export const createLoginSucceed = (school_id: string, db: RootReducerState['db'], token: string): LoginSucceed => ({ 
	type: LOGIN_SUCCEED,
	school_id,
	token,
	db
})

export const loadDB = () => (dispatch: Function, getState: () => RootReducerState, syncr: Syncr) => {

	loadDb().then(res => {
		dispatch({
			type: "LOAD_DB",
			res
		})

		const state = res;
		
		if(syncr.ready && state.auth.school_id && state.auth.token) {
			syncr
				.send({
					type: "VERIFY",
					client_type: client_type,
					payload: {
						school_id: state.auth.school_id,
						token: state.auth.token,
						client_id: state.client_id,
					}
				})
				.then(res => {
					return syncr.send({
						type: SYNC,
						client_type: client_type,
						school_id: state.auth.school_id,
						payload: state.queued,
						lastSnapshot: state.lastSnapshot
					})
				})
				.then(resp => {
					dispatch(multiAction(resp))
				})
				.catch(err => {
					console.error(err)
					alert("Authorization Failed. Log out and Log in again.")
				})
		}

	})
}

export const multiAction = (resp: { key: string, val: any }) => (dispatch: Function) => {
	for (const action of Object.values(resp)) {
		if (action) {
			dispatch(action)
		}
	}
}