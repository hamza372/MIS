
interface RootDBState {
	faculty: {
		[id: string]: MISTeacher
	}
	users: { 
		[id: string]: MISUser
	}
	students: {
		[id: string]: MISStudent
	}
	classes: { 
		[id: string]: MISClass
	}
	sms_templates: { 
		attendance: string
		fee: string
		result: string
	}
	exams: { 
		[id: string]: MISExam
	}
	settings: MISSettings
	analytics: {
		sms_history: {
			[id: string]: MISSMSHistory
		}
	}
	max_limit: number
}

interface RootReducerState {
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
	acceptSnapshot: boolean
	lastSnapshot: number
	db: RootDBState
	auth: {
		school_id: string
		faculty_id: string
		token: string
		username: string
		name: string
		attempt_failed: boolean
		loading: boolean
	}
	connected: boolean
}

interface MISSMSHistory {
	date: number
	type: string
	count: number
}

interface MISSettings {
	shareData: boolean
	schoolName: string
	schoolAddress: string
	schoolPhoneNumber: string
	sendSMSOption: "SIM" | "API"
	permissions: {
		fee: { teacher: boolean }
		dailyStats: { teacher: boolean }
		setupPage: { teacher: boolean }
	}
	devices: {
		[client_id: string]: string
	}
}

interface MISUser {
	name: string,
	password: string
	type: "admin" | "teacher"
}

interface MISClass {
	id: string
	name: string
	classYear: number
	sections: {
		[id: string]: {
			name: string,
			faculty_id?: string
		}
	}
	subjects: {
		[subject: string]: true
	}
}

interface MISStudent {
	id: string
	Name: string
	RollNumber: string
	BForm: string
	Gender: string
	Phone: string
	Fee: number
	Active: boolean

	ManCNIC: string
	ManName: string
	Birthdate: string
	Address: string
	Notes: string
	StartDate: string 
	AdmissionNumber: string

	section_id: string
	prospective_section_id?: string

	fees: {
		[id: string]: MISStudentFee
	}
	payments: {
		[id: string]: MISStudentPayment
	}
	attendance: {
		[date: string]: MISStudentAttendanceEntry
	}
	exams: {
		[id: string]: MISStudentExam
	}
	tags: { [tag: string]: boolean }
}

interface MISExam {
	id: string
	name: string
	subject: string
	total_score: number
	date: number
	class_id: string
	section_id: string
}

interface MISStudentExam {
	score: number,
	grade: string,
	remarks: string
}

interface MISStudentFee {
	name: string
	type: "FEE" | "SCHOLARSHIP" | ""
	amount: string
	period: "MONTHLY" | "SINGLE" | ""
}

interface MISStudentPayment {
	amount: number
	date: number
	type: "SUBMITTED" | "FORGIVEN" | "OWED"
	fee_id?: string
	fee_name?: string
}

interface MISStudentAttendanceEntry {
	date: string
	status: "PRESENT" | "ABSENT" | "LEAVE"
	time: number
}

interface MISTeacher {
	id: string
	Name: string 
	CNIC: string
	Gender: string
	Username: string
	Password: string
	Married: boolean
	Phone: string
	Salary: string
	Active: boolean

	ManCNIC: string
	ManName: string
	Birthdate: string
	Address: string
	StructuredQualification: string
	Qualification: string
	Experience: string
	HireDate: string
	Admin: boolean

	attendance:  MISTeacherAttendance
}

type MISTeacherAttendanceStatus = "check_in" | "check_out" | "absent" | "leave" | ""

interface MISTeacherAttendance {
	[date: string]: {
		[status in MISTeacherAttendanceStatus]: number
	}
}

interface MISSms {
	text: string
	number: string
}

interface MISSmsPayload {
	messages: MISSms[]
	return_link: string
}
