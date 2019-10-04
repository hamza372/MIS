import { v4 } from 'node-uuid'

import { openDB, deleteDB } from 'idb'
import { defaultExams } from '../modules/Settings';

const defaultTemplates = () => ({
	attendance: "$NAME has been marked $STATUS",
	fee: "$NAME has paid $AMOUNT Rs, Your remaining Balance is $BALANCE Rs",
	result: "Report is ready for $NAME:\n $REPORT"
})

export const initState : RootReducerState = {
	client_id: localStorage.getItem("client_id") || v4(),
	queued: { },
	acceptSnapshot: false,
	lastSnapshot: 0,
	initialized: false,
	db: {
		faculty: { },
		users: { },
		students: { },
		classes: { },
		sms_templates: defaultTemplates(),
		exams: { },
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
	},
}

export const loadDb = async () => {

	console.log("Runing Load DB from indexed")

	try {

		const db = await openDB('db', 1, {
			upgrade(db) {
				db.createObjectStore('root-state')
			}
		})
		
		const serialized = await db.get('root-state', 'db') //|| localStorage.getItem('db')
		
		if (!serialized) {
			return { 
				...initState,
				initialized: true
			}
		}

		const prev: RootReducerState = JSON.parse(serialized)
		const client_id = localStorage.getItem('client_id') || prev.client_id || v4()
		const merged = {
			...initState,
			...prev,
			client_id,
			db: {
				...initState.db,
				...prev.db
			},
			connected: false,
			sign_up_form: {
				loading: false,
				succeed: false,
				reason: ""
			},
			initialized: true
		}

		const updatedDB = onLoadScripts.reduce((agg, curr) => {
			try {
				const next = curr(agg)
				if (next === null) {
					return agg
				}
				return next
			}
			catch (err) {
				console.error(err)
				return agg
			}
		}, merged)

		return updatedDB

	}
	catch (err) {
		console.error(err)
		return undefined
	}
}

const checkPersistent = () => {
	// check and request persistent storage
	if(navigator.storage && navigator.storage.persist) {
		navigator.storage.persist()
			.then(persist => {
				console.log("PERSIST!!!!", persist)
			})
			.catch(err => console.error(err))

		navigator.storage.persisted()
			.then(persistent => {
				if(persistent) {
					console.log('persistent storage activated')
				}
				else {
					console.log('persistent storage denied')
				}
			})
		
			navigator.storage.estimate()
				.then(estimate => console.log("ESTIMATE!!", estimate))
				.catch(err => console.error(err))
	}
	else {
		console.log('no navigator.storage or navigator.storage.persist')
	}
}

checkPersistent();

export const saveDb = async (state: RootReducerState) => {
	
	const json = JSON.stringify(state)
	console.log("IN SAVE DB FUNCTION INDEXED DB", state)
	
	const db = await openDB('db', 1, {
		upgrade(db) {
			db.createObjectStore('root-state')
		}
	})

	await db.put('root-state', json, "db")
	
	localStorage.setItem("client_id", state.client_id)

	try {
		localStorage.setItem('db', json)
	}
	catch (err) {
		console.error("LOCALSTORAGE FAIURE !!!", err )
	}
}

const addFacultyID = (state : RootReducerState) => {

	if(state.auth.faculty_id !== undefined) {
		console.log("not running addFacultyID script")
		return state;
	}

	const faculty = Object.values(state.db.faculty).find(f => f.Name === state.auth.name);

	state.auth.faculty_id = faculty.id;

	return state;
}

const checkPermissions = (state: RootReducerState) => {

	const permission = state.db.settings.permissions

	if( permission.dailyStats !== undefined && permission.fee !== undefined &&
		permission.setupPage !== undefined && permission.expense !== undefined ) {
		console.log("NOT Running Permission Scripts")
		return state
	}
	console.log("Running Permissions Scripts");

	state.db.settings = {
		...state.db.settings,
		permissions:{
			fee: { teacher: true },
			dailyStats: {teacher: true },
			setupPage: {teacher: true},
			expense: {teacher: true },
			...state.db.settings.permissions
		}
	}
	return state;
}

const checkGrades = (state: RootReducerState) => {
	if(state.db.settings.exams){
		console.log("Not Running Grades Script")
		return state
	}

	console.log("Running Grades Script")
	state.db.settings = {
		...state.db.settings,
		exams: defaultExams
	}

	return state
}

const onLoadScripts = [
	addFacultyID,
	checkPermissions,
	checkGrades
];