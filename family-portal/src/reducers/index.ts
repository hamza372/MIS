import Dynamic from '@ironbay/dynamic'

import { MERGES, MergeAction, ON_CONNECT, ON_DISCONNECT, DELETES, DeletesAction, QueueAction, QUEUE, CONFIRM_SYNC_DIFF, ConfirmSyncAction, SnapshotDiffAction, SNAPSHOT_DIFF } from '../actions/core'
import { AnyAction, Reducer } from 'redux';
import { loadDB } from '../utils/localStorage';

const rootReducer: Reducer<RootReducerState, AnyAction> = (state: RootReducerState | undefined, action: AnyAction): RootReducerState => {

	// this never actually gets called because we initialize state in our `createStore` call
	if (state === undefined) {
		return loadDB()
	}

	console.log(action.type)

	switch (action.type) {

		case ON_CONNECT:
			{
				return {
					...state,
					connected: true
				}
			}

		case ON_DISCONNECT:
			{
				return {
					...state,
					connected: false
				}
			}

		case MERGES:
			{
				const nextState = (action as MergeAction).merges.reduce((agg, curr) => {
					return Dynamic.put(agg, curr.path, curr.value)
				}, JSON.parse(JSON.stringify(state)))

				return {
					...nextState,
					accept_snapshot: false
				}
			}

		case DELETES:
			{
				const state_copy = JSON.parse(JSON.stringify(state)) as RootReducerState

				(action as DeletesAction).paths.forEach(a => Dynamic.delete(state_copy, a.path))

				return {
					...state_copy,
					accept_snapshot: false
				}
			}

		case QUEUE:
			{
				return {
					...state,
					queued: {
						...state.queued,
						...(action as QueueAction).payload
					}
				}
			}

		case CONFIRM_SYNC_DIFF:
			{
				const diff_action = action as ConfirmSyncAction
				console.log("confirm sync diff: ",
					Object.keys(diff_action.new_writes).length,
					" changes synced")

				const newM = Object.keys(state.queued.mutations)
					.filter(t => {
						console.log(state.queued.mutations[t].date, diff_action.date, state.queued.mutations[t].date - diff_action.date);
						return state.queued.mutations[t].date > diff_action.date
					})
					.reduce((agg, curr) => {
						return Dynamic.put(agg,
							[state.queued.mutations[curr].action.path.join(',')],
							state.queued.mutations[curr])
					}, {})

				const newQ = {
					...state.queued,
					mutations: newM,
				}

				if (Object.keys(diff_action.new_writes).length > 0) {
					// remove queued items

					const nextState = Object.values(diff_action.new_writes)
						.reduce((agg, curr) => {
							if (curr.type === "DELETE") {
								return Dynamic.delete(agg, curr.path) as RootReducerState
							}
							return Dynamic.put(agg, curr.path, curr.value) as RootReducerState
						}, state)

					return {
						...nextState,
						queued: newQ,
						accept_snapshot: true,
						last_snapshot: new Date().getTime()
					}
				}

				return {
					...state,
					queued: newQ,
					accept_snapshot: true,
					last_snapshot: new Date().getTime()
				}
			}

		case SNAPSHOT_DIFF:
			{
				//@ts-ignore
				const snapshot = action as SnapshotDiffAction;
				console.log("snapshot diff: ", Object.keys(snapshot.new_writes).length, "changes broadcast")

				if (!state.accept_snapshot) {
					return state;
				}

				if (Object.keys(snapshot.new_writes).length > 0) {

					const nextState = Object.values(snapshot.new_writes)
						.reduce((agg, curr) => {
							if (curr.type === "DELETE") {
								return Dynamic.delete(agg, curr.path)
							}
							return Dynamic.put(agg, curr.path, curr.value)
						}, JSON.parse(JSON.stringify(state))) as RootReducerState;

					return {
						...nextState,
						last_snapshot: new Date().getTime()
					}

				}

				return {
					...state,
					last_snapshot: new Date().getTime()
				}
			}

		default:
			return state
	}

}

export default rootReducer;