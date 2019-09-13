import { v4 } from 'node-uuid'
import requestFS from './requestFS'
import { defaultExams } from '../modules/Settings';

const defaultTemplates = () => ({
	attendance: "$NAME has been marked $STATUS",
	fee: "$NAME has paid $AMOUNT Rs, Your remaining Balance is $BALANCE Rs",
	result: "Report is ready for $NAME:\n $REPORT"
})

const initState : RootReducerState = {
	client_id: v4(),
	queued: { },
	acceptSnapshot: false,
	lastSnapshot: 0,
	db: {
		faculty: { },
		users: { }, // username: passwordhash, permissions, etc.  
		students: { },
		classes: { }, // id: { name, class, teacher_id, subjects: { name: 1 } },
		sms_templates: defaultTemplates(),
		exams: { }, // id: { name, total_score, subject, etc. rest of info is under student }
		settings: { } as MISSettings,
		expenses: {},
		analytics: {
			sms_history: {}
		},
		assets:{
			schoolLogo:""
		},
		max_limit: -1
	},
	// this part of the tree i want to obscure.
	// but will get to that later
	auth: {
		school_id: undefined,
		faculty_id: undefined,
		token: undefined,
		username: undefined,
		name: undefined,
		attempt_failed: false,
		loading: false
	},
	connected: false,
	sign_up_form: {
		loading: false,
		succeed: false,
		reason: ""
	}
}

// export const loadDb = () => {
// 	try {
// 		const serialized = ""

// 		if (serialized === null) {
// 			console.log("null")
// 			return initState
// 		}

// 		const prev = JSON.parse(serialized);
// 		const client_id = localStorage.getItem('client_id') || prev.client_id || v4()


// 	}
// 	catch (err) {
// 		console.log(err)
// 		return undefined
// 	}
// }

export const createDb = () => {

	console.log("IN Indexed Db File -> IDb")

	let db: any;
	
	let dbReq = indexedDB.open('myDatabase', 1);

	dbReq.onupgradeneeded = (event: any) => {
		//Set db variable to our databse so we can use it
		console.log("IN onUpgradeNeeded -> IDB")


		db = event.target.result;

		let notes = db.createObjectStore('notes',
			{ autoIncrement: true }
		)
	}

	dbReq.onsuccess = (event: any) => {
		console.log("IN onSuccess -> IDB")

		db = event.target.result;

		let tx = db.transaction(['notes'], 'readwrite')
		
		let store = tx.objectStore('notes')
		
		let item = localStorage.getItem("db") || initState
		
		store.add(item)

		tx.oncomplete = () => { console.log('stored note!') }
		tx.onerror = (event: any) => {
			alert('error storing note' + event)
		}
	}

	const getDb = (db: any) => {
		let tx = db.transaction(['notes'], 'readonly')
		let store = tx.objectStore('notes')

		let req = store.get(7)

		req.onsuccess = (event: any) => {
			let db = event.target.result

			if (db) {
				console.log(db)
			}
			else {
				console.log('db not found => IDB')
			}
		}

		// If we get an error, like that the note wasn't in the object
		// store, we handle the error in the onerror handler

		req.onerror = function(event: any) {
			alert('error getting note 1 ' + event.target.errorCode);
		}
	}

	dbReq.onerror = (event: any) => {
		alert('error opening database -> IDB' + event.target.errorCode)
	}

	return "test"
	
}