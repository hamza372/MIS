import locations from './narrowed.json'
import { v4 } from 'node-uuid';

export const saveDB = (db : RootBankState) => {

	try {
		const auth_json = JSON.stringify(db.auth);
		localStorage.setItem("auth", auth_json);
	}

	catch(err) {
		console.error(err);
	}
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

export const loadClientId = () => {

	const client_id = localStorage.getItem("client_id") || v4();
	localStorage.setItem("client_id", client_id)

	return client_id;
}

export const loadDB = () : RootBankState => {

	return {
		school_locations: locations,
		filter_text: "",
		school_db: {},
		selected: undefined,
		client_id: loadClientId(),
		auth: loadAuth(),
		queued: {},
		accept_snapshot: false,
		last_snapshot: 0,
		connected: false
	}
}