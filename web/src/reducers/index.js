import Dynamic from '@ironbay/dynamic'
import { MERGE, DELETE } from '../actions'
import { loadDB } from 'utils/localStorage'
import moment from 'moment'


const initialState = loadDB() || {
	available: true,
	teachers: { },
	queued: []
}
console.log(initialState)

// we need to know what the shape of the data is somewhere...
// initialState probably not good enough.

const rootReducer = (state = initialState, action) => {

	console.log(action)
	switch(action.type) {
		case MERGE:
		{
			const next = Dynamic.put(state, action.path, action.value)
			const qnext = Dynamic.put(next, ["queued", moment().unix() * 1000], action)
			console.log(qnext)
			return qnext;
		}
		
		case DELETE:
		{
			const next = Dynamic.delete(state, action.path)
			const qnext = Dynamic.put(next, ["queued", moment().unix() * 1000], action);
			return qnext;
		}

		default: 
			return state;
	}
}

export default rootReducer;
