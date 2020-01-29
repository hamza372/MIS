workbox.routing.registerRoute(
	({ url, event }) => {
		const match = url.host === "storage.googleapis.com" ||
			url.host === "fonts.googleapis.com" ||
			url.host === "googleapis.com" ||
			url.host === "www.googleapis.com"
		return match
	},
	new workbox.strategies.CacheFirst({
		cacheName: 'images',
		plugins: [
			new workbox.expiration.Plugin({
				maxAgeSeconds: 60 * 60 * 24 * 30,
				purgeOnQuotaError: true
			})
		]
	})
)