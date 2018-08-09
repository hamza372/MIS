export const MERGE = "MERGE"
export const createMerge = (path, value) => {
	return {
		type: MERGE,
		path,
		value
	}
}

export const DELETE = "DELETE"
export const createDelete = (path) => {
	return {
		type: DELETE,
		path
	}
}