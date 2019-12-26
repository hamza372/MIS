import { v4 } from 'node-uuid'
import requestFS from './requestFS'
import { defaultExams } from '../modules/Settings';
import moment from "moment"

const defaultTemplates = () => ({
	attendance: "$NAME has been marked $STATUS",
	fee: "$NAME has paid $AMOUNT Rs, Your remaining Balance is $BALANCE Rs",
	result: "Report is ready for $NAME:\n $REPORT"
})

const initState: RootReducerState = {
	client_id: v4(),
	initialized: false,
	queued: {
		mutations: {},
		analytics: {}
	},
	acceptSnapshot: false,
	lastSnapshot: 0,
	db: {
		faculty: {},
		users: {}, // username: passwordhash, permissions, etc.  
		students: {},
		classes: {}, // id: { name, class, teacher_id, subjects: { name: 1 } },
		sms_templates: defaultTemplates(),
		exams: {}, // id: { name, total_score, subject, etc. rest of info is under student }
		settings: {} as MISSettings,
		expenses: {},
		analytics: {
			sms_history: {}
		},
		assets: {
			schoolLogo: ""
		},
		package_info: {
			date: -1,
			trial_period: 15,
			paid: false
		},
		max_limit: -1,
		diary: {} as MISDiary,
		planner: {
			datesheet: {}
		}
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
	},
}

export const loadDB = () => {
	try {
		const serialized = localStorage.getItem('db');
		if (serialized === null) {
			console.log('null')
			return initState;
		}

		const prev = JSON.parse(serialized);
		const client_id = localStorage.getItem('client_id') || prev.client_id || v4()
		// but should we make sure that fields that are no longer in the initState db are deleted?
		const merged = {
			...initState,
			...prev,
			client_id: client_id,
			db: {
				...initState.db,
				...prev.db
			},
			connected: false,
			sign_up_form: {
				loading: false,
				succeed: false,
				reason: ""
			}
		}

		// console.log(merged);

		const updatedDB = onLoadScripts.reduce((agg, curr) => {
			try {
				const next = curr(agg)
				if (next === undefined) {
					return agg;
				}
				return next;
			}
			catch (e) {
				console.error(e)
				return agg;
			}
		}, merged);

		return updatedDB;
	}
	catch (err) {
		console.error(err)
		return undefined;
	}
}

export const saveDB = (db: RootReducerState) => {
	try {
		const json = JSON.stringify(db);
		localStorage.setItem('db', json)
		localStorage.setItem("client_id", db.client_id)
	}
	catch (err) {
		console.error(err)
	}

	try {
		saveDbToFilesystem(db);
	}
	catch (e) {
		console.error(e)
	}

}

const saveDbToFilesystem = (db: RootReducerState) => {

	requestFS(20)
		.then((fs: any) => {
			//console.log('got fs');
		})
		.catch((err: any) => {
			//console.error(err)
		})

}

const checkPersistent = () => {
	// check and request persistent storage
	if (navigator.storage && navigator.storage.persist) {
		navigator.storage.persist()
			.then(persist => {
				console.log("PERSIST!!!!", persist)
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
			.then(estimate => console.log("ESTIMATE!!", estimate))
			.catch(err => console.error(err))
	}
	else {
		console.log('no navigator.storage or navigator.storage.persist')
	}
}

checkPersistent();

// add faculty_id to the auth field if it doesn't exist.
const addFacultyID = (state: RootReducerState) => {

	if (state.auth.faculty_id !== undefined) {
		console.log("not running addFacultyID script")
		return state;
	}
	console.log("running addFacultyID script")

	const faculty = Object.values(state.db.faculty).find(f => f.Name === state.auth.name);

	state.auth.faculty_id = faculty.id;

	return state;
}

const checkPermissions = (state: RootReducerState) => {

	const permission = state.db.settings.permissions

	if (permission.dailyStats !== undefined && permission.fee !== undefined &&
		permission.setupPage !== undefined && permission.expense !== undefined) {
		console.log("NOT Running Permission Scripts")
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

// this modifies db in case any schema changes have happened
// which means i should maybe version the client db formally...
const onLoadScripts = [
	addFacultyID,
	checkPermissions,
	checkGrades
];
