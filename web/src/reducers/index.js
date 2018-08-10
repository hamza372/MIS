import Dynamic from '@ironbay/dynamic'
import { MERGE, DELETE, CONFIRM_SYNC } from '../actions'
import { loadDB } from 'utils/localStorage'
import moment from 'moment'
import { v4 } from 'node-uuid'

const initialState = loadDB() || {
	school_id: "test_school",
	client_id: v4(),
	queued: { },
	db: {
		teachers: { },
	}
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
			const qnext = Dynamic.put(next, ["queued", action.path], {action, date: moment().unix() * 1000})
			console.log(qnext)
			return qnext;
		}
		
		case DELETE:
		{
			const next = Dynamic.delete(state, action.path)
			const qnext = Dynamic.put(next, ["queued", action.path], {action, date: moment().unix() * 1000});
			return qnext;
		}

		case CONFIRM_SYNC: 
		{
			const last = action.date;
			// remove all queued writes less than this last date.
			const newQ = Object.values(state.queued)
				.filter(t => state.queued[t].date > last)
				.reduce((agg, curr) => {
					return Dynamic.put(agg, ["queued", curr.action.path], curr.action)
				}, {})

			return Dynamic.put(state, ["queued"], newQ);

		}

		default: 
			return state;
	}
}

export default rootReducer;
