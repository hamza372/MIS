import { Dispatch } from 'redux'
import Syncr from '@cerp/syncr'
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

const getRationalizedQueuePayload = (payload: any, key: keyof RootReducerState['queued'], state: RootReducerState): RootReducerState['queued'] => {

	// here we can do stuff to make sure we are not including queued items that are processing.
	// for now we can make this only for images. in the future we can add support for mutations and analytics as well.

	// for now actually we will take images out of the queue
	/*
	const filtered_images = Object.entries(state.queued.images || {})
		.reduce<ImagesQueuable>((agg, [k, v]) => {
			if (v.status === "processing") {
				return agg
			}

			agg[k] = v
			return agg;
		}, {})
	*/

	return {
		...state.queued,
		images: {},
		[key]: {
			...state.queued[key],
			...payload
		}
	}
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

	const rationalized_event_payload = getRationalizedQueuePayload(event_payload, "analytics", state)

	dispatch(QueueAnalytics(event_payload))

	if (!syncr.connection_verified) {
		console.warn("connection not verified")
		return
	}

	dispatch(Sync(rationalized_event_payload))
}

export const uploadImages = (images: ImageMergeItem[]) => (dispatch: (a: any) => any, getState: () => RootReducerState, syncr: Syncr) => {

	const queueable = images.reduce<ImagesQueuable>((agg, curr) => {
		const key = curr.path.join(",")

		agg[key] = {
			...curr,
			status: "queued"
		}

		return agg;

	}, {})

	dispatch(QueueImages(queueable))

	const local_merges = images.map<Merge>(m => ({
		path: m.path,
		value: {
			image_string: m.image_string
		}
	}))

	dispatch({
		type: MERGES,
		merges: local_merges
	})

	dispatch(processImageQueue())

}

export const IMAGE_UPLOAD_CONFIRM = "IMAGE_UPLOAD_CONFIRM"
export interface ImageUploadConfirmation {
	type: "IMAGE_UPLOAD_CONFIRM"
	value: {
		url: string
		id: string
	}
	path: string[]
	id: string
}

export const IMAGE_QUEUE_LOCK = "IMAGE_QUEUE_LOCK"
const lockImageQueue = {
	type: IMAGE_QUEUE_LOCK
}

export const IMAGE_QUEUE_UNLOCK = "IMAGE_QUEUE_UNLOCK"
const unlockImageQueue = {
	type: IMAGE_QUEUE_UNLOCK
}

export const processImageQueue = () => (dispatch: (a: any) => any, getState: () => RootReducerState, syncr: Syncr) => {

	const state = getState();

	if (state.processing_images) {
		console.log('already processing')
		return;
	}

	if (!syncr.connection_verified) {
		console.log('connection not verified')
		return;
	}

	dispatch(lockImageQueue)

	console.log('processing image queue')

	// need to know if this processing is already running or not...
	// if it is running, then we should return early. 
	// so we need this in reducer state

	// for now, we ignore it.

	console.log(state.queued.images)
	const items = Object.entries(state.queued.images || {})
		.filter(([k, v]) => v.status === "queued")

	if (items.length === 0) {
		console.log('nothing to process in queue')
		dispatch(unlockImageQueue)
		return
	}

	const [merge_key, image_merge] = items[0]

	//@ts-ignore
	const host = window.api_url || window.debug_host;

	fetch(`https://${host}/upload/image`, {
		method: 'POST',
		mode: 'cors',
		cache: 'no-cache',
		headers: {
			'content-type': 'application/json',
			'token': state.auth.token,
			'client-id': state.client_id,
			'school-id': state.auth.school_id,
			'client-type': client_type
		},
		body: JSON.stringify({
			lastSnapshot: state.lastSnapshot,
			payload: {
				image_merge
			}
		})
	})
		.then(res => {
			console.log('image uploaded')
			console.log(res)
			console.log(res.json())

			dispatch(markImagesInQueue({
				[merge_key]: image_merge
			}, 'processing'))

			dispatch(unlockImageQueue)
			dispatch(processImageQueue())

			// now we should mark this item as 'processing' in the queue.
			// and progress to the next one.
			// syncr.on('connect') should kick  
		})
		.catch(err => {
			console.error('image upload failed')
			dispatch(markImagesInQueue({
				[merge_key]: image_merge
			}, 'queued'))

			dispatch(unlockImageQueue)
			dispatch(processImageQueue())
		})

}

const markImagesInQueue = (images: ImagesQueuable, status: QueueStatus) => (dispatch: (a: any) => any) => {

	const mapped = Object.entries(images)
		.reduce<ImagesQueuable>((agg, [k, v]) => {
			return {
				...agg,
				[k]: {
					...v,
					status
				}
			}
		}, {})

	dispatch(QueueImages(mapped))

}

const Sync = (payload: RootReducerState['queued']) => (dispatch: (a: any) => any, getState: () => RootReducerState, syncr: Syncr) => {

	const state = getState()
	syncr.send({
		type: SYNC,
		school_id: state.auth.school_id,
		client_type: client_type,
		lastSnapshot: state.lastSnapshot,
		payload
	})
		.then(res => {
			// dispatch multiaction
			dispatch(multiAction(res))
		})
		.catch(err => {
			// go through payload, mark all images as error
			// may need to handle specific errors here.
			// really should have different timeout if there are images here
			// uploading will be slow
			// and really it could be happening over a different channel altogether.
			// this could be http
			// for now this should work.

			dispatch(markImagesInQueue(payload.images, "queued"))

			console.error("sync error:", err)

			if (state.connected && err !== "timeout") {
				alert("Syncing Error: " + err)
			}
		})

}

export const createMerges = (merges: Merge[]) => (dispatch: (a: any) => any, getState: () => RootReducerState, syncr: Syncr) => {
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
	const rationalized_merges = getRationalizedQueuePayload(new_merges, "mutations", state)

	dispatch(QueueMutations(new_merges))

	if (!syncr.connection_verified) {
		console.warn("connection not verified")
		return;
	}

	dispatch(Sync(rationalized_merges))
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

export const sendServerAction = (action: ServerAction) => (dispatch: Dispatch, getState: () => RootReducerState, syncr: Syncr) => {
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

	const rationalized_deletes = getRationalizedQueuePayload(payload, "mutations", state)

	dispatch(QueueMutations(payload))

	if (!syncr.connection_verified) {
		console.warn("connection not verified")
		return;
	}

	dispatch(Sync(rationalized_deletes))

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

export interface QueueImagesAction extends BaseQueueAction {
	queue_type: "images"
	payload: ImagesQueuable
}

export type QueueAction = QueueMutationsAction | QueueAnalyticsAction | QueueImagesAction

export interface ConfirmAnalyticsSyncAction {
	type: "CONFIRM_ANALYTICS_SYNC";
	time: number
}

export const QueueMutations = (action: MutationsQueueable): QueueMutationsAction => {
	return {
		type: QUEUE,
		payload: action,
		queue_type: "mutations"
	}
}

export const QueueAnalytics = (action: AnalyticsQueuable): QueueAnalyticsAction => {
	return {
		type: QUEUE,
		payload: action,
		queue_type: "analytics"
	}
}

export const QueueImages = (action: ImagesQueuable): QueueImagesAction => {
	return {
		type: QUEUE,
		payload: action,
		queue_type: "images"
	}
}

export const ON_CONNECT = "ON_CONNECT"
export const ON_DISCONNECT = "ON_DISCONNECT"
export const connected = () => (dispatch: (a: any) => any, getState: () => RootReducerState, syncr: Syncr) => {
	const action = { type: ON_CONNECT }

	dispatch(action)

	const state = getState();

	if (state.auth.school_id && state.auth.token) {
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

				console.log("VERIFYY")
				syncr.verify()

				dispatch(Sync(state.queued))
			})
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

	console.time('load-db')
	loadDb().then(res => {
		console.timeEnd('load-db')
		dispatch({
			type: "LOAD_DB",
			res
		})

		const state = res;

		if (syncr.ready && state.auth.school_id && state.auth.token) {
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

					console.log("VERIFYYYY")
					syncr.verify()

					dispatch(Sync(state.queued))
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