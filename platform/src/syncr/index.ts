import { connected, disconnected } from '~/src/actions/core'
import { Action } from 'redux'
import sleep from '~/src/utils/sleep'
import { v4 } from 'node-uuid'

export default class Syncr {

	url: string;
	ready: boolean;
	ws?: WebSocket;
	pingInterval?: NodeJS.Timeout;
	dispatch: (action: any) => void;
	pending: Map<string, { resolve: (a: any) => any, reject: (a :any) => any}>;
	message_timeout: number;

	constructor(url : string, dispatch: (action: any) => void) {

		this.url = url;
		this.ready = false;
		this.ws = undefined;
		this.pingInterval = undefined;
		this.dispatch = dispatch;
		this.message_timeout = 10000;

		this.pending = new Map(); // key: uuid, value: promise

		this.connect();
	}

	async connect() {
		this.ws = new WebSocket(this.url);

		this.ws.onopen = () => {
			this.ready = true;
			clearInterval(this.pingInterval);
			this.pingInterval = setInterval(() => this.ping(), 5000)

			this.dispatch(connected())
			
		}

		this.ws.onclose = async (e) => {
			if(this.ready) {
				this.pending.forEach(promise => promise.reject("disconnect"));
				this.dispatch(disconnected())

			}
			this.cleanup();
			await sleep(9000 * Math.random() + 1000);
			this.connect();
		}

		this.ws.onerror = err => {} //console.error("websocket err", err)

		this.ws.onmessage = event => {
			const msg = JSON.parse(event.data)

			console.log("<--- server", msg.type)

			if(msg.key) {
				if(!this.pending.has(msg.key)) {
					console.error("mesage not found in pending - will not process")
					return
				}

				const promise = this.pending.get(msg.key);

				if(msg.type === "failure") {
					promise.reject(msg.payload)
				}
				else {
					promise.resolve(msg.payload)
				}
				this.pending.delete(msg.key);
			}
			else {
				this.dispatch(msg);
			}
		}
	}

	cleanup() {
		this.ready = false;
		clearInterval(this.pingInterval)
		this.ws = undefined;
	}

	ping() {
		if(this.ready){
			try {
				this.ws.send("ping")
			}
			catch (e) {
				console.error(e);
			}
		}
	}

	async send(message : any) {
		if(!this.ready) {
			throw new Error("not ready");
		}

		// make a key
		// create promise, put in map
		// when its returned, trigger it.
		console.log("server --->", message)
		const key = v4();
		return new Promise((resolve, reject) => {

			this.pending.set(key, {resolve, reject});

			this.ws.send(JSON.stringify({
				key,
				payload: message
			}));

			setTimeout(() => {
				if(this.pending.has(key)) {
					console.log("MSG TIMEOUT!!!")
					this.pending.get(key).reject("timeout")
				}
				this.pending.delete(key);
			}, this.message_timeout)
		});

	}

}