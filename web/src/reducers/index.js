import { combineReducers } from 'redux'
import { CREATE_TEACHER, DELETE_TEACHER, UPDATE_TEACHER } from '../actions'

const initialState = {
	available: true,
	teachers: { },
	queuedWrites: []
}

// this function accepts current state, and action
// and returns the "new state" of the application.

const rootReducer = (state = initialState, action) => {

	switch(action.type) {
		case CREATE_TEACHER:
			return {
				...state,
				teachers: {
					...state.teachers,
					[action.payload.ID]: action.payload
				}
			}
		case UPDATE_TEACHER:
			return {
				...state,
				teachers: {
					...state.teachers,
					[action.payload.ID]: {...state.teachers[action.payload.ID], ...action.payload}
				}
			}
		case DELETE_TEACHER:
			const { [action.payload.ID]: deleted_teacher, ...teachers } = this.state.teachers;
			console.log("DELETING", deleted_teacher)
			return {
				...state,
				teachers 
			}
		default: 
			return state;
	}
	return state;
}

export default rootReducer;
