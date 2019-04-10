export const generateIntent = (host : string, path: string, scheme: string, android_package: string, payload = {} as MISSmsPayload) => {

	return `intent://${host}/${path}?payload=${encodeURI(JSON.stringify(payload))}#Intent;scheme=${scheme};package=${android_package};end`
}

export const smsIntentLink = (payload : MISSmsPayload) => {

	// payload must be an array of { text: string, number: string }

	return generateIntent("mis.metal.fish", "android-sms", "https", "pk.org.cerp.mischool.mischoolcompanion", payload);
}