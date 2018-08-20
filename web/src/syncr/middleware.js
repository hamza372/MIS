import { MERGE, MERGES, DELETE, QueueUp, INIT_SYNC } from 'actions'
import moment from 'moment'

const syncrware = factory => store => next => action => {

	const result = next(action);
	const state = store.getState();

	if(action.type === MERGE || action.type === DELETE) {
		// if we're offline then we should also dispatch an action to queue the action

		factory.getSyncr().send({
			type: "SYNC",
			school_id: state.school_id,
			payload: {
				[action.path]: {
					action,
					date: moment().unix() * 1000
				}
			}
		})
		.then(store.dispatch)
		.catch(err => store.dispatch(QueueUp(action)))
	}

	if(action.type === MERGES) {

		const payload = {
			type: "SYNC",
			school_id: state.school_id,
			payload: action.merges.reduce((agg, curr) => {
				return {
					...agg, 
					[curr.path.join(',')]: {
						action: {
							type: "MERGE",
							path: curr.path, 
							value: curr.value
						},
						date: moment().unix() * 1000
					}
				}
			}, {})
		}
		factory.getSyncr().send(payload)
			.then(store.dispatch)
	}

	if(action.type === INIT_SYNC) {
		factory.getSyncr().send({
			type: "SYNC",
			school_id: state.school_id,
			payload: state.queued
		})
		.then(stuff => {
			store.dispatch(stuff)
		})
	}

	return result;
}

export default syncrware;