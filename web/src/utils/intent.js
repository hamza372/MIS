
export const generateIntent = (host, path, scheme, android_package, payload = []) => {

		return `intent://${host}/${path}?payload=${encodeURI(JSON.stringify(payload))}#Intent;scheme=${scheme};package=${android_package};end`
}

export const smsIntentLink = (payload) => {

	// payload must be an array of { text: string, number: string }

	return generateIntent("mis.metal.fish", "android-sms", "https", "pk.org.cerp.mischool.mischoolcompanion", payload);

}