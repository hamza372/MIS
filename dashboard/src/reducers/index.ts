import Dynamic from '@ironbay/dynamic'

import { MERGES, MergeAction, ON_CONNECT, ON_DISCONNECT, DELETES, DeletesAction, QueueAction, QUEUE, CONFIRM_SYNC_DIFF, ConfirmSyncAction, SnapshotDiffAction, SNAPSHOT_DIFF, LOGIN_SUCCEED, LoginSucceed } from 'actions/core'
import { SCHOOL_LIST, REFERRALS_INFO, SCHOOL_INFO, ADD_USERS, AddUserAction } from 'actions/index'
import { AnyAction } from 'redux';

const rootReducer = (state: RootReducerState, action: AnyAction): RootReducerState => {

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

		case ADD_USERS:
			{
				const { users } = action as AddUserAction
				return {
					...state,
					users: {
						...state.users,
						...users
					}
				}
			}


		case LOGIN_SUCCEED:
			{
				const { id, token, role, permissions } = action as LoginSucceed
				return {
					...state,
					auth: {
						...state.auth,
						id,
						token,
						role,
						permissions
					}
				}
			}

		case SCHOOL_LIST:
			{
				return {
					...state,
					school_Info: {
						...state.school_Info,
						school_list: action.school_list
					}
				}
			}

		case REFERRALS_INFO:
			{
				return {
					...state,
					trials: action.trials
				}
			}

		case SCHOOL_INFO:
			{
				return {
					...state,
					school_Info: {
						...state.school_Info,
						trial_info: (action as SchoolInfoAction).trial_info,
						student_info: (action as SchoolInfoAction).student_info,
						meta: (action as SchoolInfoAction).meta
					}
				}
			}


		case "STUDENT_ATTENDANCE_DATA":
			{
				return {
					...state,
					stats: {
						...state.stats,
						student_attendance: (action as StudentAttendanceAction).payload
					}
				}
			}

		case "TEACHER_ATTENDANCE_DATA":
			{
				return {
					...state,
					stats: {
						...state.stats,
						teacher_attendance: (action as TeacherAttendanceAction).payload
					}
				}
			}

		case "FEES_DATA":
			{
				return {
					...state,
					stats: {
						...state.stats,
						fees: (action as FeesAction).payload
					}
				}
			}

		case "EXAMS_DATA":
			{
				return {
					...state,
					stats: {
						...state.stats,
						exams: (action as ExamsAction).payload
					}
				}
			}

		case "EXPENSE_DATA":
			{
				return {
					...state,
					stats: {
						...state.stats,
						expense: (action as ExpenseAction).payload
					}
				}
			}

		case "SMS_DATA":
			{
				return {
					...state,
					stats: {
						...state.stats,
						sms: (action as SmsAction).payload
					}
				}
			}

		case "DIARY_DATA":
			{
				return {
					...state,
					stats: {
						...state.stats,
						diary: (action as DiaryAction).payload
					}
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

				console.log(
					"confirm sync diff: ",
					Object.keys(diff_action.new_writes).length,
					"changes synced")

				const newQ = Object.keys(state.queued)
					.filter(t => {
						console.log(state.queued[t].date, diff_action.date, state.queued[t].date - diff_action.date)
						return state.queued[t].date > diff_action.date
					})
					.reduce((agg, curr) => {
						return Dynamic.put(agg, ["queued", state.queued[curr].action.path], state.queued[curr].action)
					}, {})

				if (Object.keys(diff_action.new_writes).length > 0) {
					const nextState = Object.values(diff_action.new_writes)
						.reduce((agg, curr) => {
							if (curr.type === "DELETE") {
								return Dynamic.delete(agg, curr.path)
							}
							return Dynamic.put(agg, curr.path, curr.value)
						}, JSON.parse(JSON.stringify(state)))

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