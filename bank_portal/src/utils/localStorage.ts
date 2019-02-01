import locations from './narrowed.json'
import { v4 } from 'node-uuid';

export const saveDB = (db : RootBankState) => {

	try {
		const auth_json = JSON.stringify(db.auth);
		localStorage.setItem("auth", auth_json);

		saveSyncState(db.sync_state);
		saveSnapshot(db.last_snapshot);
	}

	catch(err) {
		console.error(err);
	}
}

export const clearDB = () => {
	localStorage.removeItem("auth")
	localStorage.removeItem("sync_state")
	localStorage.removeItem("last_snapshot")
}

export const loadAuth = (): RootBankState['auth'] => {

	let init_auth : RootBankState['auth'] = {
		id: undefined as string,
		token: undefined as string,
		username: undefined as string,
		attempt_failed: false,
		loading: false,
		client_type: "bank_portal"
	};

	try {
		const str = localStorage.getItem("auth")
		if(str === null) {
			console.log('no auth saved');
			return init_auth;
		}

		return JSON.parse(str);
	}
	catch(err) {
		console.error(err);
		return init_auth;
	}
}

const loadClientId = () => {

	const client_id = localStorage.getItem("client_id") || v4();
	localStorage.setItem("client_id", client_id)

	return client_id;
}

const loadSyncState = () => {

	const str = localStorage.getItem("sync_state");

	if(str === undefined || str == "" || str == "null") {
		return {
			matches: {

			}
		} as RootBankState['sync_state']
	}

	return JSON.parse(str) as RootBankState['sync_state'];
}

const saveSyncState = (sync_state : RootBankState['sync_state']) => {

	localStorage.setItem("sync_state", JSON.stringify(sync_state));
}

const saveSnapshot = (last_snapshot : number) => {

	//@ts-ignore
	localStorage.setItem("last_snapshot", last_snapshot);
}

const loadSnapshot = () => {
	return parseInt(localStorage.getItem("last_snapshot") || "0")
}

export const loadDB = () : RootBankState => {

	return {
		selected: undefined,
		filter_text: "",

		school_locations: locations,
		school_db: {},
		client_id: loadClientId(),
		auth: loadAuth(),
		queued: {},
		accept_snapshot: false,
		last_snapshot: loadSnapshot(),
		connected: false,
		sync_state: loadSyncState()
	}
}