import { v4 } from 'uuid';

export const saveDB = (db : RootReducerState) => {

	try {

		saveAuth(db.auth)
		saveSyncState(db.sync_state);
		saveSnapshot(db.last_snapshot);
		saveQueue(db.queued)
	}

	catch(err) {
		console.error(err);
	}
}

export const clearDB = () => {
	localStorage.removeItem("auth")
	localStorage.removeItem("sync_state")
	localStorage.removeItem("last_snapshot")
	localStorage.removeItem("school_db")
}

export const loadAuth = (): RootReducerState['auth'] => {

	let init_auth : RootReducerState['auth'] = {
		id: undefined,
		token: undefined,
		client_type: "dashboard"
	};

	try {
		const str = localStorage.getItem("auth")
		if(str === null) {
			return init_auth;
		}

		return JSON.parse(str);
	}
	catch(err) {
		console.error(err);
		return init_auth;
	}
}

export const saveAuth = (auth: RootReducerState['auth']) => {
	localStorage.setItem("auth", JSON.stringify(auth))
}

const loadClientId = () => {

	const client_id = localStorage.getItem("client_id") || v4();
	localStorage.setItem("client_id", client_id)

	return client_id;
}

const loadSyncState = () : RootReducerState['sync_state'] => {

	const str = localStorage.getItem("sync_state");

	if(str) {
		const curr = JSON.parse(str) as RootReducerState['sync_state']
		return curr;
	}

	return {};

}

const saveSyncState = (sync_state : RootReducerState['sync_state']) => {

	localStorage.setItem("sync_state", JSON.stringify(sync_state));
}

const saveQueue = (queue : RootReducerState['queued']) => {

	localStorage.setItem("queued", JSON.stringify(queue))

}

const loadQueue = () => {
	return JSON.parse(localStorage.getItem("queued") || "{}") as RootReducerState['queued']
}

const saveSnapshot = (last_snapshot : number) => {

	//@ts-ignore
	localStorage.setItem("last_snapshot", last_snapshot);
}

const loadSnapshot = () => {
	return parseInt(localStorage.getItem("last_snapshot") || "0")
}

export const loadDB = () : RootReducerState => {

	return {
		client_id: loadClientId(),
		auth: loadAuth(),
		queued: loadQueue(),
		accept_snapshot: false,
		last_snapshot: loadSnapshot(),
		connected: false,
		sync_state: loadSyncState(),
		school_Info: {
			school_list: [""]
		}
	}
}
