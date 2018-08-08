import Dynamic from '@ironbay/dynamic'
import { MERGE, DELETE } from '../actions'
import { loadDB } from 'utils/localStorage'


const initialState = loadDB() || {
	available: true,
	teachers: { },
	queuedWrites: []
}
console.log(initialState)

// we need to know what the shape of the data is somewhere...
// initialState probably not good enough.

const rootReducer = (state = initialState, action) => {

	console.log(action)
	switch(action.type) {
		case MERGE:
			const next = Dynamic.put(state, action.path, action.value)
			console.log(next)
			return next;
		
		case DELETE:
			return Dynamic.delete(state, action.path)

		default: 
			return state;
	}
}

export default rootReducer;
