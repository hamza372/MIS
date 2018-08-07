import { v4 } from 'node-uuid'

export const CREATE_TEACHER = 'CREATE_TEACHER'
export const createTeacher = (Name, Sex, Birthday, Email, Password, CNIC, Phone) => {

	return {
		type: CREATE_TEACHER,
		write: true,
		payload: {
			ID: v4(),
			Name,
			Sex,
			Birthday,
			Email,
			Password,
			CNIC,
			Phone
		}
	}
}

export const DELETE_TEACHER = 'DELETE_TEACHER'
export const deleteTeacher = (ID) => {
	return {
		type: DELETE_TEACHER,
		write: true,
		payload: {
			ID
		}
	}
}

export const UPDATE_TEACHER = 'UPDATE_TEACHER'
export const updateTeacher = (ID, Name, Sex, Birthday, Email, Password, CNIC, Phone) => {
	return {
		type: UPDATE_TEACHER,
		write: true,
		payload: {
			ID,
			Name,
			Sex,
			Birthday,
			Email,
			Password,
			CNIC,
			Phone
		}
	}
}