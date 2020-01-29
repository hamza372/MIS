import { v4 } from 'node-uuid'

import { openDB, IDBPDatabase, IDBPTransaction } from 'idb'
import { defaultExams } from 'modules/Settings';
import Dynamic from '@cerp/dynamic'
import moment from 'moment';

const defaultTemplates = () => ({
	attendance: "$NAME has been marked $STATUS",
	fee: "$NAME has paid $AMOUNT Rs, Your remaining Balance is $BALANCE Rs",
	result: "Report is ready for $NAME:\n $REPORT"
})

export const initState: RootReducerState = {
	client_id: localStorage.getItem("client_id") || v4(),
	queued: {
		mutations: {},
		analytics: {},
		images: {}
	},
	acceptSnapshot: false,
	lastSnapshot: 0,
	initialized: false,
	processing_images: false,
	db: {
		faculty: {},
		users: {},
		students: {},
		classes: {},
		sms_templates: defaultTemplates(),
		exams: {},
		settings: {} as MISSettings,
		expenses: {},
		analytics: {
			sms_history: {}
		},
		assets: {
			schoolLogo: ""
		},
		max_limit: -1,
		package_info: {
			date: -1,
			trial_period: 15,
			paid: false
		},
		diary: {} as MISDiary,
		planner: {
			datesheet: {}
		}
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

const upgradeOneToTwo = (db: IDBPDatabase<unknown>, oldVersion: number, newVersion: number, transaction: IDBPTransaction<unknown, string[]>) => {

	try {
		db.createObjectStore('root-state')
	}
	catch (e) {
		console.error(e)
	}

	try {
		db.createObjectStore('flattened-state')
	}
	catch (e) {
		console.error(e)
	}

	// get data from 1, put it into 2
	console.log('returning transaction promise')
	return transaction.db.get('root-state', 'db')
		.then(oldDb => {
			const parsed: RootReducerState = JSON.parse(oldDb)

			return db.put('root-state', parsed)
		})
		.then(res => {
			console.log("COMPLETED migration")
			transaction.db.close()
		})
		.catch(err => {
			console.error('migration error: ', err)
		})

}

export const loadDb = async () => {

	//console.log("Runing Load DB from indexed")

	try {

		const db = await openDB('db', 2, {
			upgrade(db, oldVersion, newVersion, transaction) {
				console.log('upgrading from ', oldVersion, 'to ', newVersion)

				if (oldVersion === 1) {
					return upgradeOneToTwo(db, oldVersion, newVersion, transaction)
				}

			}
		})

		const localData = localStorage.getItem('db')

		// let serialized = await db.get('root-state', 'db')

		const tx = db.transaction('flattened-state', 'readonly')
		const store = tx.objectStore('flattened-state')

		console.time('inflate')
		const serialized = await store.openCursor()
			.then(function inflate(cursor, agg = {}): any {
				if (!cursor) {
					return agg;
				}

				console.time('get-path')
				const path = cursor.key.toString().split(',')
				const value = cursor.value
				const next = Dynamic.put(agg, path, value)
				console.timeEnd('get-path')

				return cursor.continue().then(c => inflate(c, next))
			})

		console.timeEnd('inflate')

		if (!serialized && localData) {

			console.log("Tranferring Local Data to IDB")

			db.put('root-state', localData, 'db')
				.then((res) => {
					console.log("CREATING BACKUP")
					try {
						localStorage.setItem('backup', localData)
						localStorage.removeItem('db')
					}
					catch (err) {
						console.error("BACK UP TO LOCALSTORAGE FAIURE !!!", err)
					}
				})
				.catch((err) => {
					console.error("ERROR WHILE TRANFERING LOCAL DATA TO IDB", err)
				})

			const res = await db.getAll('flattened-state')

		} else {
			// console.log("Not Tranferring Local Data to IDB")
		}

		if (!serialized) {
			return {
				...initState,
				initialized: true
			}
		}

		let prev: RootReducerState;
		if (typeof serialized === "string") {
			prev = JSON.parse(serialized)
		}
		else {

			prev = serialized
		}

		const client_id = localStorage.getItem('client_id') || prev.client_id || v4()

		if (prev.queued && (!prev.queued.mutations || !prev.queued.analytics)) {
			console.log("MOVING FROM OLD QUEUE")

			prev.queued = {
				analytics: {},
				//@ts-ignore
				mutations: {
					...prev.queued
				}
			}
		}
		else {
			console.log("NOT MOVING FROM OLD QUEUE")
		}

		const merged: RootReducerState = {
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
			initialized: true,
			processing_images: false
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
	if (navigator.storage && navigator.storage.persist) {
		navigator.storage.persist()
			.then(persist => {
				//console.log("PERSIST!!!!", persist)
			})
			.catch(err => console.error(err))

		navigator.storage.persisted()
			.then(persistent => {
				if (persistent) {
					console.log('persistent storage activated')
				}
				else {
					console.log('persistent storage denied')
				}
			})

		navigator.storage.estimate()
			.then(estimate => {
				//console.log("ESTIMATE!!", estimate)
			})
			.catch(err => console.error(err))
	}
	else {
		console.log('no navigator.storage or navigator.storage.persist')
	}
}

checkPersistent();

export const saveDb = (state: RootReducerState) => {

	const s1 = new Date().getTime();
	console.log("SAVING IDB-START")

	// console.log("IN SAVE DB FUNCTION INDEXED DB", state)

	const flattened = Dynamic.flatten(state)

	openDB('db', 2, {
		upgrade(db, oldVersion, newVersion, transaction) {
			if (oldVersion === 1) {
				return upgradeOneToTwo(db, oldVersion, newVersion, transaction)
			}
		}
	})
		.then(db => {
			// console.log('putting db')

			/*
			const tx = db.transaction('flattened-state', "readwrite")
			flattened.forEach(({ path, value }) => {
				tx.db.put('flattened-state', value, path.join(','))
			})
			tx.done.then(r => {
				console.log('done with saving flattened state')
			})
			*/

			db.put('root-state', state, "db")
			const s2 = new Date().getTime()
			console.log("SAVING IDB-END", s2 - s1, "milliseconds");
		})
		.catch(err => {
			console.error(err)
			alert("Error saving database. Please contact helpline")
		})
}

const addFacultyID = (state: RootReducerState) => {

	if (state.auth.faculty_id !== undefined) {
		//console.log("not running addFacultyID script")
		return state;
	}

	const faculty = Object.values(state.db.faculty).find(f => f.Name === state.auth.name);

	state.auth.faculty_id = faculty.id;

	return state;
}

const checkPermissions = (state: RootReducerState) => {

	const permission = state.db.settings.permissions

	if (permission.dailyStats !== undefined && permission.fee !== undefined &&
		permission.setupPage !== undefined && permission.expense !== undefined) {
		// console.log("NOT Running Permission Scripts")
		return state
	}
	console.log("Running Permissions Scripts");

	state.db.settings = {
		...state.db.settings,
		permissions: {
			fee: { teacher: true },
			dailyStats: { teacher: true },
			setupPage: { teacher: true },
			expense: { teacher: true },
			...state.db.settings.permissions
		}
	}
	return state;
}

const checkGrades = (state: RootReducerState) => {
	if (state.db.settings.exams) {
		// console.log("Not Running Grades Script")
		return state
	}

	console.log("Running Grades Script")
	state.db.settings = {
		...state.db.settings,
		exams: defaultExams
	}

	return state
}

// re-constructing old structure [grade: string]: string to
// [grade: string]: { percent: string, remarks: string }

const reconstructGradesObject = (state: RootReducerState) => {

	if (state.db.settings && state.db.settings.exams) {

		const grades_values = Object.values(state.db.settings.exams.grades)

		// check if new structure already exists
		if (typeof (grades_values[0]) === "object") {
			return state
		}

		// else construct new structure using previous information
		const grades = Object.entries(state.db.settings.exams.grades)
		state.db.settings.exams.grades = grades.reduce((agg, [grade, val]) => {
			return {
				...agg,
				[grade]: {
					percent: val,
					remarks: ""
				}
			}
		}, {})
	}

	return state
}
const addSchoolSessionSettings = (state: RootReducerState) => {
	if (state.db.settings) {

		if (state.db.settings.schoolSession) {
			return state
		}

		const start_date = moment().startOf("year").unix() * 1000
		const end_date = moment().add(1, "year").startOf("year").unix() * 1000

		state.db.settings = {
			...state.db.settings,
			schoolSession: {
				start_date,
				end_date
			}
		}
	}

	return state
}

const onLoadScripts = [
	addFacultyID,
	checkPermissions,
	checkGrades,
	reconstructGradesObject,
	addSchoolSessionSettings
];