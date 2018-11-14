
const requestFs = window.requestFileSystem || window.webkitRequestFileSystem;

// default size: 1gb
const requestFSPromise = (sizeMB = 10) => {


	return new Promise((resolve, reject) => {
		if(requestFs) {
			requestFs(window.PERSISTENT, sizeMB * 1000000, resolve, reject);
		}
		else {
		}
	})
}

export default requestFSPromise;