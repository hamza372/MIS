interface SyncState {

}

interface RootReducerState {
	sync_state: SyncState
	auth: {
		id?: string
		phone_number?: string
		school_id?: string
		token?: string
		client_type: "family-portal"
	}
	client_id: string
	queued: {
		mutations: {
			[path: string]: {
				action: {
					path: string[]
					value?: any
					type: "MERGE" | "DELETE"
				}
				date: number
			}
		}
		analytics: {
			[id: string]: RouteAnalyticsEvent
		}
		images: ImagesQueuable
	}
	processing_images: boolean
	last_snapshot: number
	accept_snapshot: boolean
	connected: boolean
}

interface ImageMergeItem {
	id: string
	image_string: string
	path: string[]
}

interface ImagesQueuable {
	[path: string]: ImageMergeItem & { status: QueueStatus }
}

interface BaseAnalyticsEvent {
	type: string
	meta: any
}
interface RouteAnalyticsEvent extends BaseAnalyticsEvent {
	type: "ROUTE"
	time: number
	meta: { route: string }
}

type QueueStatus = "queued" | "processing" | "failed"