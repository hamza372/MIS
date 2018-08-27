import { v4 } from 'node-uuid'

const initState = {
	client_id: v4(),
	queued: { },
	acceptSnapshot: false,
	db: {
		teachers: { },
		users: { } // username: passwordhash, permissions, etc. 
	},
	// this part of the tree i want to obscure.
	// but will get to that later
	auth: {
		school_id: undefined,
		token: undefined,
		username: undefined,
		attempt_failed: false,
		loading: false
	},
	connected: false
}

export const loadDB = () => {
	try {
		const serialized = localStorage.getItem('db');
		if (serialized === null) {
			console.log('null')
			return initState;
		}

		return {
			...initState,
			...JSON.parse(serialized),
			connected: false
		}
	}
	catch(err) {
		console.error(err)
		return undefined;
	}
}

export const saveDB = (db) => {
	try {
		const json = JSON.stringify(db);
		localStorage.setItem('db', json)
	}
	catch(err) {
		console.error(err)
	}
}

// check and request persistent storage
if(navigator.storage && navigator.storage.persist) {
	navigator.storage.persisted()
		.then(persistent => {
			if(persistent) {
				console.log('persistent storage activated')
			}
			else {
				console.log('persistent storage denied')
			}
		})
}
else {
	console.log('no navigator.storage or navigator.storage.persist')
}