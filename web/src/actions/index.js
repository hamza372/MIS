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

// this is only produced by the server. 
// it will tell us it hsa confirmed sync up to { date: timestamp }
export const CONFIRM_SYNC = "CONFIRM_SYNC"