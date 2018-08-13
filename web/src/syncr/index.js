import { MERGE, DELETE, QueueUp, INIT_SYNC, createInitSync} from 'actions'
import moment from 'moment'

export const syncrware = factory => store => next => action => {
	console.log('syncrware', action)

	const result = next(action);
	const state = store.getState();

	//if  we run a MERGE or DELETE action, we should sync. 
	if(action.type === MERGE || action.type === DELETE) {
		// if we're offline then we should also dispatch an action to queue the action

		factory.getSyncr().send(JSON.stringify({
			type: "SYNC",
			school_id: state.school_id,
			payload: {
				[action.path]: {
					action,
					date: moment().unix() * 1000
				}
			}
		}))
		.then(res => console.log('result!'))
		.catch(err => store.dispatch(QueueUp(action)))
	}

	if(action.type === INIT_SYNC) {
		factory.getSyncr().send(JSON.stringify({
			type: "SYNC",
			school_id: state.school_id,
			payload: state.queued
		}))
	}

	return result;
}

export default class Syncr {

	constructor(url, dispatch) {

		this.url = url;
		this.ready = false;
		this.ws = undefined;
		this.pingInterval = undefined;
		this.dispatch = dispatch;

		this.connect()

	}

	async connect() {
		this.ws = new WebSocket(this.url);

		this.ws.onopen = () => {
			console.log('ws open')
			this.ready = true;
			clearInterval(this.pingInterval);
			this.pingInterval = setInterval(() => this.ping(), 5000)

			this.dispatch(createInitSync())
			
		}

		this.ws.onclose = (e) => {
			this.cleanup();
			this.connect();
		}

		this.ws.onerror = err => {} //console.error("websocket err", err)

		this.ws.onmessage = event => {
			const msg = JSON.parse(event.data)
			console.log('got message', msg);
			this.dispatch(msg);

			// first I send my updates
			// then I receive the new snapshot
			// server needs to know my client id
			// and the last update i received

			// this is either going to be a snapshot
			// or idk what else.
			// either way, it will have a type
			// also need a way for the server to say "ok ive processed your queued messages up til date x"
			// then we can remove those from our queue
		}
	}

	cleanup() {
		this._ready = false;
		clearInterval(this.pingInterval)
		this.ws = undefined;
	}

	ping() {
		this.send("ping")
	}

	async send(message) {
		if(!this.ready) {
			// we want batched update behaviour from the queue, so this is not good.
			throw new Error("not ready");
		}

		this.ws.send(message);
	}

}