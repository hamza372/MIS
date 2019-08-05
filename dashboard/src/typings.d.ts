interface SyncState {

}

interface RootReducerState {
	sync_state: SyncState 
	auth: {
		id?: string
		token?: string
		client_type: "dashboard"
	}
	client_id: string
	queued: {
		[path: string]: {
			action: {
				path: string[]
				value?: any
				type: "MERGE" | "DELETE"
			}
			date: number
		}
	}
	last_snapshot: number
	accept_snapshot: boolean
	connected: boolean
	school_Info: {
		school_list: string[]
	}
}

interface SignUpValue {
	package_name: "FREE_TRIAL" | "TALEEM1" | "TALEEM2" | "TALEEM3"
	area_manager_name: "AYESHA" | "UMER" | "FAROOQ" | "ZAHID" | "KAMRAN" | ""
	office: "" | "LAHORE" | "SARGODHA" | "SIALKOT" | "GUJRANWALA" | "FAISALABAD"
	city: string
	type_of_login: "" | "SCHOOL_REFERRAL" | "ASSOCIATION" | "EDFIN" | "INDIVIDUAL" | "AGENT"

	school_name: string
	owner_name: string
	owner_easypaisa_number: string

	association_name: string

	agent_name: string
	agent_easypaisa_number: string

	notes: string
}