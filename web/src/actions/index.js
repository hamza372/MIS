import { hash } from 'utils'
import { createMerges, createLoginSucceed, createLoginFail } from './core'

export const MERGE_FACULTY = "MERGE_FACULTY"
export const createFacultyMerge = (faculty) => dispatch => {

	dispatch(createMerges([
		{path: ["db", "faculty", faculty.id], value: faculty},
		{path: ["db", "users", faculty.id], value: {
			username: faculty.Username,
			password: faculty.Password,
			type: faculty.Admin ? "admin" : "teacher"
		}}
	]))
}

export const MERGE_STUDENT = "MERGE_STUDENT"
export const createStudentMerge = (student) => dispatch => {

	dispatch(createMerges([
		{path: ["db", "students", student.id], value: student},
	]))
}

export const LOCAL_LOGIN = "LOCAL_LOGIN"
export const createLogin = (username, password) => dispatch => {

	hash(password)
		.then(hashed => {
			console.log(hashed)
			dispatch({
				type: LOCAL_LOGIN,
				username,
				password: hashed
			})
		})
}

export const SCHOOL_LOGIN = "SCHOOL_LOGIN"
export const createSchoolLogin = (school_id, password) => (dispatch, getState, syncr) => {

	const action = {
		type: SCHOOL_LOGIN,
		school_id,
		password
	}

	dispatch(action);

	syncr.send({
		type: "LOGIN",
		payload: {
			school_id,
			password,
			client_id: getState().client_id
		}
	})
	.then(res => {
		console.log(res)
		
		dispatch(createLoginSucceed(school_id, res.db, res.token))
	})
	.catch(err => {
		console.error(err)
		dispatch(createLoginFail())
	})
}

export const createEditClass = newClass => dispatch => {
	dispatch(createMerges([
			{path: ["db", "classes", newClass.id], value: newClass}
		]
	))
}

export const addStudentToSection = (section_id, student) => dispatch => {

	dispatch(createMerges([
		{path: ["db", "students", student.id, "section_id"], value: section_id}
	]))
}

export const removeStudentFromSection = (student) => dispatch => {

	dispatch(createMerges([
		{path: ["db", "students", student.id, "section_id"], value: ""}
	]))
}

export const markStudent = (student, date, status) => dispatch => {
	console.log('mark student', student, ' as', status)

	dispatch(createMerges([
		{path: ["db", "students", student.id, "attendance", date], value: {
			date,
			status
		}}
	]))

	// eventually dispatches merges
	return {
		type: "ATTENDANCE"
	}
}