
interface RootDBState {
	faculty: {
		[id: string]: MISTeacher;
	};
	users: { 
		[id: string]: MISUser;
	};
	students: {
		[id: string]: MISStudent;
	};
	classes: { 
		[id: string]: MISClass;
	};
	sms_templates: { 
		attendance: string;
		fee: string;
		result: string;
	};
	exams: { 
		[id: string]: MISExam;
	};
	settings: MISSettings;
	expenses: {
		[id: string]: MISExpense | MISSalaryExpense;
	};
	analytics: {
		sms_history: {
			[id: string]: MISSMSHistory
		}
	}
	assets : {
		schoolLogo : string
	}
	max_limit: number
	package_info: {
		date: number
		trial_period: number
		paid: boolean
	}
	diary : MISDiary
}

interface RootReducerState {
	client_id: string;
	initialized: boolean;
	queued: {
		[path: string]: {
			action: {
				path: string[];
				value?: any;
				type: "MERGE" | "DELETE";
			}; 
			date: number; 
		}; 
	};
	acceptSnapshot: boolean;
	lastSnapshot: number;
	db: RootDBState;
	auth: {
		school_id: string;
		faculty_id: string;
		token: string;
		username: string;
		name: string;
		attempt_failed: boolean;
		loading: boolean;
	};
	connected: boolean;
	sign_up_form: {
		loading: boolean;
		succeed: boolean;
		reason: string;
	};
}

interface MISSMSHistory {
	date: number;
	type: string;
	count: number;
}


interface MISSettings {
	shareData: boolean
	schoolName: string
	schoolAddress: string
	schoolPhoneNumber: string
	schoolCode: string
	vouchersPerPage: string
	sendSMSOption: "SIM" | "API"
	permissions: {
		fee: { teacher: boolean };
		dailyStats: { teacher: boolean };
		setupPage: { teacher: boolean };
		expense: { teacher: boolean };
	};
	devices: {
		[client_id: string]: string;
	};
	exams: {
		grades: {
			[grade: string]: string;
		};
	};
}

interface MISUser {
	name: string;
	password: string;
	type: "admin" | "teacher";
}

interface MISClass {
	id: string;
	name: string;
	classYear: number;
	sections: {
		[id: string]: {
			name: string;
			faculty_id?: string;
		};
	};
	subjects: {
		[subject: string]: true;
	};
}

interface MISStudent {
	id: string;
	Name: string;
	RollNumber: string;
	BForm: string;
	Gender: string;
	Phone: string;
	Fee: number;
	Active: boolean;

	ManCNIC: string;
	ManName: string;
	Birthdate: string;
	Address: string;
	Notes: string;
	StartDate: number; 
	AdmissionNumber: string;
	BloodType?: "" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
	FamilyID?: string;

	section_id: string;
	prospective_section_id?: string;

	fees: {
		[id: string]: MISStudentFee;
	};
	payments: {
		[id: string]: MISStudentPayment;
	};
	attendance: {
		[date: string]: MISStudentAttendanceEntry;
	};
	exams: {
		[id: string]: MISStudentExam;
	};
	tags: { [tag: string]: boolean };
	certificates: {
		[id: string]: MISCertificate; 
	};
}

interface MISFamilyInfo { 
	ManName: string;
	Phone: string;
	ManCNIC: string;
	Address: string;
}

interface MISCertificate {
	type: string;
	faculty_id: string;
	date: number;
}

interface MISExam {
	id: string;
	name: string;
	subject: string;
	total_score: number;
	date: number;
	class_id: string;
	section_id: string;
}

interface MISStudentExam {
	score: number;
	grade: string;
	remarks: string;
}

interface MISStudentFee {
	name: string;
	type: "FEE" | "SCHOLARSHIP" | "";
	amount: string;
	period: "MONTHLY" | "SINGLE" | "";
}

interface MISStudentPayment {
	amount: number;
	date: number;
	type: "SUBMITTED" | "FORGIVEN" | "OWED";
	fee_id?: string;
	fee_name?: string;
}

interface BaseMISExpense {
	expense: string;
	amount: number;
	label: string;
	type: string;
	category: "SALARY" | "BILLS" | "STATIONERY" | "REPAIRS" | "RENT" | "ACTIVITY" | "DAILY" | "PETTY_CASH" | "";   
	date: number;
	time: number;
}

interface MISExpense extends BaseMISExpense {
	expense: "MIS_EXPENSE";
	type: "PAYMENT_GIVEN";
	quantity: number;
}

interface MISSalaryExpense extends BaseMISExpense {
	expense: "SALARY_EXPENSE";
	type: "PAYMENT_DUE" | "PAYMENT_GIVEN";
	faculty_id: string;
	category: "SALARY";
	advance: number;
	deduction: number;
	deduction_reason: string;
}


interface MISStudentAttendanceEntry {
	date: string;
	status: "PRESENT" | "ABSENT" | "LEAVE" | "SHORT_LEAVE" | "SICK_LEAVE" | "CASUAL_LEAVE";
	time: number;
}

interface MISTeacher {
	id: string;
	Name: string; 
	CNIC: string;
	Gender: string;
	Username: string;
	Password: string;
	Married: boolean;
	Phone: string;
	Salary: string;
	Active: boolean;

	ManCNIC: string;
	ManName: string;
	Birthdate: string;
	Address: string;
	StructuredQualification: string;
	Qualification: string;
	Experience: string;
	HireDate: string;
	Admin: boolean;

	attendance:  MISTeacherAttendance;
}

type MISTeacherAttendanceStatus = "check_in" | "check_out" | "absent" | "leave" | ""

interface MISTeacherAttendance {
	[date: string]: {
		[status in MISTeacherAttendanceStatus]: number
	};
}

interface MISSms {
	text: string;
	number: string;
}

interface MISSmsPayload {
	messages: MISSms[];
	return_link: string;
}

interface MISDiary{
	[date: string]: {
		[section_id: string]: {
			[subject: string]: {
				homework: string;
			};
		};
	};
}
