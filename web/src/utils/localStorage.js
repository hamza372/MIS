import { v4 } from 'node-uuid'

const initState = {
	client_id: v4(),
	queued: { },
	acceptSnapshot: false,
	db: {
		faculty: { },
		users: { }, // username: passwordhash, permissions, etc.  
		students: { },
		classes: { } // id: { name, class, teacher_id, subjects: { name: 1 } }
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
		
		const prev = JSON.parse(serialized);
		// but should we make sure that fields that are no longer in the initState db are deleted?
		const merged = {
			...initState,
			...prev,
			db: {
				...initState.db,
				...prev.db
			},
			connected: false
		}

		console.log(merged);

		const updatedDB = onLoadScripts.reduce((agg, curr) => {
			try {
				const next = curr(agg)
				if(next === undefined) {
					return agg;
				}
				return next;
			}
			catch(e) {
				console.error(e)
				return agg;
			}
		}, merged);
		return updatedDB;
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

// add faculty_id to the auth field if it doesn't exist.
const addFacultyID = state => {

	if(state.auth.faculty_id !== undefined) {
		console.log("not running addFacultyID script")
		return state;
	}
	console.log("running addFacultyID script")

	const faculty = Object.values(state.db.faculty).find(f => f.Username === state.auth.username);

	state.auth.faculty_id = faculty.id;

	return state;
}

// convert the old single "monthly fee" field of student into the new fee map.
const addFeeMapToStudents = state => {

	state.db.students = Object.entries(state.db.students)
		.reduce((agg, [id, student]) => {
			if(student.fees !== undefined) {
				agg[id] = student;
				return agg;
			}

			agg[id] = {
				...student,
				fees: {
					[v4()]: {
						name: "Monthly Fee",
						amount: student.Fee,
						type: "FEE", // FEE, SCHOLARSHIP
						period: "M"  // M: MONTHLY, Y: YEARLY 
					}
				}
			};
			return agg;
		}, {})

	return state;
}

// this modifies db in case any schema changes have happened
// which means i should maybe version the client db formally...
const onLoadScripts = [
	addFacultyID,
	addFeeMapToStudents
];
