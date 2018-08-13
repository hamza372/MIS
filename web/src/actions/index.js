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
export const SNAPSHOT = "SNAPSHOT"

export const QUEUE = "QUEUE"
export const QueueUp = (action) => {
	return {
		type: QUEUE,
		payload: action
	}
}

export const INIT_SYNC = "INIT_SYNC"
export const createInitSync = () => ({
	type: INIT_SYNC
})