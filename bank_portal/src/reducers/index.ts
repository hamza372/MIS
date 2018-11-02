import * as redux from 'redux'
import locations from './narrowed.json'

import { SELECT_LOCATION, SelectLocationAction, ADD_SCHOOL, addSchoolAction} from '~/src/actions'


const initialState : RootBankState = {
	school_locations: locations,
	school_db: {},
	selected: undefined,
	auth: {
		id: undefined,
		token: undefined,
		username: undefined,
		attempt_failed: false,
		loading: false
	}

}

const rootReducer = (state : RootBankState = initialState, action: redux.Action<any>) : RootBankState => {

	console.log(action.type)

	switch(action.type) {
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

		default:
			return state
	}
}

export default rootReducer;