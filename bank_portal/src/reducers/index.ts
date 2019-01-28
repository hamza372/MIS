import * as redux from 'redux'
import locations from './narrowed.json'
import Dynamic from '@ironbay/dynamic'

import { MERGES, MergeAction, DELETES, DeletesAction, CONFIRM_SYNC, CONFIRM_SYNC_DIFF, QUEUE, QueueAction, SNAPSHOT, ON_CONNECT, ON_DISCONNECT, LOGIN_FAIL, LOGIN_SUCCEED, SNAPSHOT_DIFF } from '~/src/actions/core'
import {Actions, SELECT_LOCATION, SelectLocationAction, ADD_SCHOOL, addSchoolAction, SET_FILTER, SetFilterAction } from '~/src/actions'
import { v4 } from 'node-uuid';


const initialState : RootBankState = {
	school_locations: locations,
	filter_text: "",
	school_db: {},
	selected: undefined,
	auth: {
		id: undefined,
		token: undefined,
		username: undefined,
		attempt_failed: false,
		loading: false,
		client_type: "bank_portal"
	},
	client_id: v4(),
	queued: {},
	accept_snapshot: false,
	last_snapshot: 0,
	connected: false
}

const rootReducer = (state : RootBankState = initialState, action: Actions) : RootBankState => {

	console.log("action type:", action.type)

	switch(action.type) {

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
			}, JSON.parse(JSON.stringify(state)));

			return {
				...nextState,
				accept_snapshot: false
			}
		}

		case DELETES: 
		{
			const state_copy = JSON.parse(JSON.stringify(state)) as RootBankState;

			(action as DeletesAction).paths.forEach(a => Dynamic.delete(state_copy, a.path));

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

		case SELECT_LOCATION:
		{
			return {
				...state,
				selected: (<SelectLocationAction>action).loc
			}
		}

		case ADD_SCHOOL:
		{
			return {
				...state,
				school_db: {
					...state.school_db,
					[(action as addSchoolAction).school.id]: (action as addSchoolAction).school
				}
			}
		}

		case SET_FILTER:
		{
			return {
				...state,
				filter_text: (action as SetFilterAction).filter_text
			}
		}

		default:
			return state
	}
}

export default rootReducer;