import {createInitSync} from 'actions'
import { v4 } from 'node-uuid'

export default class Syncr {

	constructor(url, school_id, dispatch) {

		this.url = url;
		this.ready = false;
		this.ws = undefined;
		this.pingInterval = undefined;
		this.dispatch = dispatch;

		this.pending = new Map(); // key: uuid, value: promise

		this.connect();
	}

	async connect() {
		this.ws = new WebSocket(this.url);

		this.ws.onopen = () => {
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

			if(msg.key) {
				this.pending.get(msg.key).resolve(msg.payload)
				this.pending.delete(msg.key);
			}
			else {
				this.dispatch(msg);
			}
		}
	}

	cleanup() {
		this._ready = false;
		clearInterval(this.pingInterval)
		this.ws = undefined;
	}

	ping() {
		if(this.ready)
			this.ws.send("ping")
	}

	async send(message) {
		if(!this.ready) {
			throw new Error("not ready");
		}

		// make a key
		// create promise, put in map
		// when its returned, trigger it.
		const key = v4();
		return new Promise((resolve, reject) => {

			this.pending.set(key, {resolve, reject});

			this.ws.send(JSON.stringify({
				key,
				payload: message
			}));
		});

	}

}