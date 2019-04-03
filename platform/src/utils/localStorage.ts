import { v4 } from 'node-uuid';

const mask_number_bank = Array(100).fill(1).map((x, i) => `0${4232500600 + i}`);

export const saveDB = (db : RootBankState) => {

	try {
		const auth_json = JSON.stringify(db.auth);
		localStorage.setItem("auth", auth_json);

		saveSyncState(db.sync_state);
		saveSnapshot(db.last_snapshot);
		saveSchoolDb(db.new_school_db)
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

export const loadAuth = (): RootBankState['auth'] => {

	let init_auth : RootBankState['auth'] = {
		id: undefined as string,
		token: undefined as string,
		username: undefined as string,
		number: undefined as string,
		attempt_failed: false,
		loading: false,
		client_type: "bank_portal"
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

const loadClientId = () => {

	const client_id = localStorage.getItem("client_id") || v4();
	localStorage.setItem("client_id", client_id)

	return client_id;
}

const loadSyncState = () : RootBankState['sync_state'] => {

	const str = localStorage.getItem("sync_state");

	const masked_numbers = 	mask_number_bank.reduce((agg, curr) => ({
		...agg,
		[curr]: {
			status: "FREE"
		}
	}), {})

	if(str == undefined || str == "" || str == "null") {
		return {
			matches: {

			},
			numbers: {

			},
			mask_pairs: masked_numbers
		}
	}

	// merge mask_pairs with the mask_number_bank

	const curr = JSON.parse(str) as RootBankState['sync_state']

	return {
		...curr,
		mask_pairs: {
			...masked_numbers,
			...curr.mask_pairs
		}
	}
}

const saveSyncState = (sync_state : RootBankState['sync_state']) => {

	localStorage.setItem("sync_state", JSON.stringify(sync_state));
}

const saveQueue = (queue : RootBankState['queued']) => {

	localStorage.setItem("queued", JSON.stringify(queue))

}

const loadQueue = () => {
	return JSON.parse(localStorage.getItem("queued") || "{}") as RootBankState['queued']
}

const saveSchoolDb = (db : RootBankState['new_school_db']) => {

	localStorage.setItem("school_db", JSON.stringify(db))
}

const loadSchoolDb = () => {
	return JSON.parse(localStorage.getItem("school_db") || "{}")
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
		school_locations: {},
		school_db: {},
		new_school_db: loadSchoolDb(),
		client_id: loadClientId(),
		auth: loadAuth(),
		queued: loadQueue(),
		accept_snapshot: false,
		last_snapshot: loadSnapshot(),
		connected: false,
		sync_state: loadSyncState()
	}
}
