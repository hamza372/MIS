
const encoder = new TextEncoder("utf-8");

export async function hash(str) {
	try {
		const msgBuffer = encoder.encode(str);
		const hashBuffer = await crypto.subtle.digest("SHA-512", msgBuffer)

		const hashArray = Array.from(new Uint8Array(hashBuffer))

		const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('')
		return hashHex;
	}
	catch (ex) {
		console.error(ex);

		return 'xxxxx'
	}

}
