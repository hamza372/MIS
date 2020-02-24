interface SyncState {

}

interface RootReducerState {
	sync_state: SyncState 
	auth: {
		id?: string
		token?: string
		role?: string
		permissions?: UserPermissions
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
		trial_info?: {
			date: string
			paid: boolean
			trial_period: number
		}
		student_info?: {
			max_limit: number
		}
		meta?: TrialsDataRow["value"]
	},
	trials: TrialsDataRow[]
	stats: {
		student_attendance?: {
			data: StudentAttendanceData[]
			total_students: number
		}
		teacher_attendance?: {
			data: TeacherAttendanceData[]
			total_teachers: number
		}
		fees?: {
			data: StudentFeesData[]
			total_students: number
		}
		exams?: {
			data: StudentExamsData[]
			total_students: number
		}
		expense?: {
			data: ExpenseData[]
		}
		sms?: {
			data: SmsData[]
		}
		diary?: {
			data: DiaryData[]
		}
	}
}

interface SchoolInfoAction {
	type: "SCHOOL_INFO",
	trial_info: RootReducerState["school_Info"]["trial_info"]
	student_info: RootReducerState["school_Info"]["student_info"]
	meta: TrialsDataRow["value"]
}

interface StudentAttendanceAction {
	type: "STUDENT_ATTENDANCE_DATA"
	payload: RootReducerState["stats"]["student_attendance"]
}

interface StudentAttendanceData {
	date: string
	school_id: string
	students_marked: number
}

interface TeacherAttendanceAction {
	type: "TEACHER_ATTENDANCE_DATA"
	payload: RootReducerState["stats"]["teacher_attendance"]
}
interface TeacherAttendanceData {
	date: string
	school_id: string
	teachers_marked: number
}

interface FeesAction {
	type: "FEES_DATA"
	payload: RootReducerState["stats"]["fees"]
}

interface StudentFeesData {
	date: string
	num_payments: number
	school_id: string
	total: number
	unique_students: number
}

interface ExamsAction {
	type: "EXAMS_DATA"
	payload: RootReducerState["stats"]["exams"]
}

interface StudentExamsData {
	date: string
	exams: number
	school_id: string
	students_graded: number
}

interface ExpenseAction {
	type: "EXPENSE_DATA"
	payload: RootReducerState["stats"]["expense"]
}

interface ExpenseData {
	date: string
	expense_usage: number
}

interface SmsAction {
	type: "SMS_DATA"
	payload: RootReducerState["stats"]["sms"]
}

interface SmsData {
	date: string
	sms_usage: number
}

interface DiaryAction {
	type: "DIARY_DATA"
	payload: RootReducerState["stats"]["diary"]
}

interface DiaryData {
	date: string
	diary_usage: number
}

interface TrialsDataRow {
	school_id: string
	time: number
	value: {
		agent_easypaisa_number: string
		agent_name: string
		area_manager_name: string
		association_name: string
		city: string
		notes: string
		office: string
		owner_easypaisa_number: string
		owner_name: string
		package_name: string
		school_name: string
		type_of_login: string
		owner_phone: string
		payment_received: boolean
		backcheck_status: string
		warning_status: string
		follow_up_status: string
		trial_reset_status: string
		overall_status: string
		user: string
		school_type: string
	}
}

interface SignUpValue {
	package_name: "FREE_TRIAL" | "TALEEM1" | "TALEEM2" | "TALEEM3"
	area_manager_name: "AYESHA" | "UMER" | "FAROOQ" | "ZAHID" | "KAMRAN" | "NOMAN" | ""
	office: "" | "LAHORE" | "SARGODHA" | "SIALKOT" | "GUJRANWALA" | "FAISALABAD" | "ISLAMABAD" | "RAWALPINDI"
	city: string
	type_of_login: "" | "SCHOOL_REFERRAL" | "ASSOCIATION" | "EDFIN" | "INDIVIDUAL" | "AGENT" | "PLATFORM" | "AGENT_SCHOOL"

	school_name: string
	owner_name: string
	owner_easypaisa_number: string

	association_name: string

	agent_name: string

	notes: string
	user: string
	owner_phone: string
	school_type: string
}

interface UserPermissions {
	new_school: boolean
	new_user: boolean
	stats: boolean
	trials: boolean
}