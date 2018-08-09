
// if the action is a write action.
// should keep an array of all of these which should be 
// flushed over websocket if/when there is an available connection.
// this should also be saved/loaded to/from local storage 
export const middleware = store => next => action => {
	console.log('middletest', action)
	return next(action);
}

class Syncr {

	constructor(url) {

		this.url = url;
		this.ready = false;
		this.ws = undefined;
		this.pingInterval = undefined;

	}

	connect() {
		this.ws = new WebSocket(this.url);

		this.ws.onopen = () => {
			console.log('ws open')
			this.ready = true;

			clearInterval(this.pingInterval);

			this.pingInterval = setInterval(this.ping, 5000)
			
		}
	}

	ping() {
		this.send("ping")
	}

	send(message) {
		if()
	}

}