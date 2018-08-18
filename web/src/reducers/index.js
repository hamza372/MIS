import Dynamic from '@ironbay/dynamic'
import { MERGE, MERGES, DELETE, CONFIRM_SYNC, QUEUE, SNAPSHOT, LOGIN } from '../actions'
import { loadDB } from 'utils/localStorage'
import moment from 'moment'
import { v4 } from 'node-uuid'

const initialState = loadDB() || {
	school_id: "test_school",
	client_id: v4(),
	queued: { },
	acceptSnapshot: false,
	db: {
		teachers: { },
		users: { } // username: passwordhash, permissions, etc
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
			return {...Dynamic.put(state, action.path, action.value)}
		}

		case MERGES:
		{
			return action.merges.reduce((agg, curr) => {
				return {...Dynamic.put(agg, curr.path, curr.value)}
			}, state);

		}
		
		case DELETE:
		{
			return {...Dynamic.delete(state, action.path)}
		}

		case QUEUE:
		{

			const next = Dynamic.put(state, ["queued", action.payload.path], {action: action.payload, date: moment().unix() * 1000});
			return {
				...next,
				acceptSnapshot: false
			}
		}

		case CONFIRM_SYNC: 
		{
			const last = action.date;
			// action = {db: {}, date: number}

			// remove all queued writes less than this last date.
			const newQ = Object.keys(state.queued)
				.filter(t => state.queued[t].date > last)
				.reduce((agg, curr) => {
					return Dynamic.put(agg, ["queued", curr.action.path], curr.action)
				}, {})

			const next = Dynamic.put(state, ["queued"], newQ);
			return {
				...Dynamic.put(next, ["db"], action.db),
				acceptSnapshot: true
			}
		}

		case SNAPSHOT:
		{
			if(state.acceptSnapshot && Object.keys(action.db).length > 0) {
				console.log('applying snapshot')
				return {...Dynamic.put(state, ["db"], action.db)}
			}

			return state;
		}

		case LOGIN:
		{

			return state;
		}

		default: 
			return state;
	}
}

export default rootReducer;
