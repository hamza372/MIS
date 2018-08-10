import sleep from 'utils/sleep' 

// if the action is a write action.
// should keep an array of all of these which should be 
// flushed over websocket if/when there is an available connection.
// this should also be saved/loaded to/from local storage 
const middleware = store => next => action => {
	console.log('middletest', action)
	return next(action);
}

export default class Syncr {

	constructor(url, onMessage) {

		this.url = url;
		this.ready = false;
		this.ws = undefined;
		this.pingInterval = undefined;
		this.onMessage = onMessage;

		this.connect()

	}

	async connect() {
		this.ws = new WebSocket(this.url);

		this.ws.onopen = () => {
			console.log('ws open')
			this.ready = true;

			clearInterval(this.pingInterval);

			this.pingInterval = setInterval(() => this.ping(), 5000)
			
		}

		this.ws.onclose = (e) => {
			this.cleanup();
			this.connect();
		}

		this.ws.onerror = err => {} //console.error("websocket err", err)

		this.ws.onmessage = event => {
			const msg = JSON.parse(event.data)
			console.log('got message', msg);
			this.onMessage(msg);

			// first i send my updates
			// then i receive the new snapshot
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