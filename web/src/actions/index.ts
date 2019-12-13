import { hash } from 'utils'
import { createMerges, createDeletes, createLoginFail, analyticsEvent } from './core'
import moment from 'moment'
import {v4} from "node-uuid"
import Syncr from 'syncr';
import { historicalPayment } from 'modules/Settings/HistoricalFees/historical-fee';

const client_type = "mis";

export const MERGE_SETTINGS = "MERGE_SETTINGS"

export const mergeSettings = (settings: MISSettings) => (dispatch: Function) => {
	console.log(settings)
	dispatch(createMerges([
		{
			path: ["db", "settings"],
			value: settings
		}
	]))
}

export const MERGE_FACULTY = "MERGE_FACULTY"
export const createFacultyMerge = (faculty: MISTeacher) => (dispatch: Function) => {

	dispatch(createMerges([
		{path: ["db", "faculty", faculty.id], value: faculty},
		{path: ["db", "users", faculty.id], value: {
			name: faculty.Name,
			password: faculty.Password,
			type: faculty.Admin ? "admin" : "teacher"
		}}
	]))
}

export const MERGE_STUDENT = "MERGE_STUDENT"
export const createStudentMerge = (student: MISStudent) => (dispatch: Function) => {

	dispatch(createMerges([
		{
			path: ["db", "students", student.id],
			value: student
		},
	]))
}

export const createStudentMerges = (students: MISStudent[]) => (dispatch: Function) => {

	dispatch(createMerges(
		students.map(s => ({
			path: ["db", "students", s.id],
			value: s
		}))
	))

}

export const deleteStudent = (student: MISStudent) => (dispatch: Function) => {
	dispatch(createDeletes([
		{
			path: ["db", "students", student.id]
		}
	]))
}

export const deleteFaculty = (faculty_id: string) => (dispatch: Function, getState: () => RootReducerState) => {
	
	const state = getState()

	const faculty = state.db.faculty[faculty_id]

	if(faculty === undefined || state.auth.name === faculty.Name) {
		alert("Cannot delete this teacher they are currently logged in on this device")
		return;
	}

	const deletes = []

	for(const c of Object.values(state.db.classes)){
		for(const s_id of Object.keys(c.sections)){
			if(c.sections[s_id].faculty_id !== undefined && c.sections[s_id].faculty_id === faculty_id){
				deletes.push({
					path:["db", "classes", c.id, "sections", s_id, "faculty_id" ]
				})
			}
		}
	}
	
 	dispatch(createDeletes([
		{
			path: ["db", "faculty", faculty_id]
		},
		{
			path: ["db", "users", faculty_id]
		},
		...deletes
	])) 
}

type PromotionMap = {
	[student_id: string]: {
		current: string;
		next: string;
	};
}

type Section = {
	id: string;
	class_id: string;
	namespaced_name: string;
	className: string;
	classYear: number;
	name: string;
	faculty_id?: string;
}

export const promoteStudents = (promotion_map: PromotionMap, section_metadata: Section[]) => (dispatch: Function) => {

	// accept a map of key: student_id, value: {current, next}

	// think about the case when someone promotes up and down repeatedly. 
	// this will overwrite their history... instead of adding to it.


	const merges = Object.entries(promotion_map).reduce((agg, [student_id, {current, next}]) => {

				if(next === "FINISHED_SCHOOL"){
					return [...agg, 
						{
							path: ["db","students", student_id, "Active"],
							value: false
						},
						{
							path: ["db", "students", student_id, "section_id"],
							value: ""
						},
						{
							path: ["db", "students", student_id, "class_history", current, "end_date"],
							value: new Date().getTime()
						},
						{
							path:["db", "students", student_id, "tags", next],
							value: true
						}
					]
				}

				const meta = section_metadata.find(x => x.id === next);
				return [...agg,
					{
						path: ["db", "students", student_id, "section_id"],
						value: next
					},
					{
						path: ["db", "students", student_id, "class_history", current, "end_date"],
						value: new Date().getTime()
					},
					{
						path: ["db", "students", student_id, "class_history", next],
						value: {
							start_date: new Date().getTime(),
							class_id: meta.class_id, // class id
							class_name: meta.className,
							namespaced_name: meta.namespaced_name
						}
					}
				]
			

			}, [])

			console.log(merges)

	dispatch(createMerges(merges))
}

export const LOCAL_LOGOUT = "LOCAL_LOGOUT"
export const createLogout = () => {
	return {
		type: LOCAL_LOGOUT
	}
}

export const LOCAL_LOGIN = "LOCAL_LOGIN"
export const createLogin = (name: string, password: string) => (dispatch: Function) => {

	hash(password)
		.then(hashed => {
			dispatch({
				type: LOCAL_LOGIN,
				name,
				password: hashed
			})
		})
}

export const SIGN_UP_LOADING = "SIGN_UP_LOADING"
export const SIGN_UP_SUCCEED = "SIGN_UP_SUCCEED"
export const SIGN_UP_FAILED = "SIGN_UP_FAILED"

type Profile = {
	name: string;
	phone: string;
	city: string;
	schoolName: string;
	packageName: "Free-Trial" | "Taleem-1" | "Taleem-2" | "Taleem-3";
  }

export const createSignUp = (profile: Profile) => (dispatch: Function, getState: () => RootReducerState, syncr: Syncr) => {

	// dispatch action to say you are loading/sending the sign up
	dispatch({
		type: SIGN_UP_LOADING
	})

 	syncr.send({
		type: "SIGN_UP",
		client_type,
		sign_up_id: v4(),
		payload:{
			...profile,
		}
	})
	.then(res => {
		console.log(res)
		dispatch({
			type: SIGN_UP_SUCCEED
		})
		// dispatch action to say sign up succeeded
	})
	.catch(err => {
		console.error(err)
		if(err === "timeout")
		{
			console.log('your internet sucks')
		}
		
		dispatch({
			type: SIGN_UP_FAILED,
			reason: err
		})
		// dispatch action to say sign up failed
	})

 }

export const SCHOOL_LOGIN = "SCHOOL_LOGIN"
export const createSchoolLogin = (school_id: string, password: string) => (dispatch: Function, getState: () => RootReducerState, syncr: Syncr) => {

	const action = {
		type: SCHOOL_LOGIN,
		school_id,
		password
	}

	dispatch(action);

	syncr.send({
		type: "LOGIN",
		client_type,
		payload: {
			school_id,
			password,
			client_id: getState().client_id
		}
	})
	.then(res => {
		
		dispatch({
			type: "GETTING_DB"
		})
		
	})
	.catch(err => {
		console.error(err)
		dispatch(createLoginFail())
	})
}

export const createEditClass = (newClass: MISClass) => (dispatch: Function) => {
	dispatch(createMerges([
			{path: ["db", "classes", newClass.id], value: newClass}
		]
	))
}

export const deleteClass = (Class: MISClass) => (dispatch: Function, getState: () => RootReducerState) => {
	const state = getState();
	
	const students = Object.values(state.db.students)
		.filter(student => Class.sections[student.section_id] !== undefined )
		.map(student => (
			{ path: ["db","students",student.id, "section_id"], value:"" }
		))

	dispatch( createMerges(students) )

	dispatch(createDeletes([
		{
			path:["db", "classes", Class.id]
		}
	])) 
}

export const addStudentToSection = (section_id: string, student: MISStudent) => (dispatch: Function) => {

	dispatch(createMerges([
		{path: ["db", "students", student.id, "section_id"], value: section_id}
	]))
}

export const removeStudentFromSection = (student: MISStudent) => (dispatch: Function) => {

	dispatch(createMerges([
		{path: ["db", "students", student.id, "section_id"], value: ""}
	]))
}

export const markStudent = (student: MISStudent, date: string, status: MISStudentAttendanceEntry["status"], time = moment.now()) => (dispatch: Function) => {

	dispatch(createMerges([
		{
			path: ["db", "students", student.id, "attendance", date],
			value: {
				date,
				status,
				time
			}
		}
	]))
}	

export const markAllStudents = (students: MISStudent[], date: string, status: MISStudentAttendanceEntry["status"], time = moment.now()) => (dispatch: Function) => {

	const merges = students.reduce((agg, s) => {

		return [
			...agg, 
			{
				path: ["db", "students", s.id, "attendance", date],
				value: {
					date,
					status,
					time
				}
			},
		]}, [])

	dispatch(createMerges(merges));
}

export const addStudentToFamily = (student: MISStudent, family_id: string) => (dispatch: Function) => {

	dispatch(createMerges([
		{
			path: ["db", "students", student.id, "FamilyID"],
			value: family_id
		}
	]))
}

export const saveFamilyInfo = (siblings: MISStudent[], info: MISFamilyInfo) => (dispatch: Function) => {

	const siblingMerges = siblings.map(s => ([
		{
			path: ["db", "students", s.id, "ManName"],
			value: info.ManName
		},
		{
			path: ["db", "students", s.id, "Phone"],
			value: info.Phone
		},
		{
			path: ["db", "students", s.id, "ManCNIC"],
			value: info.ManCNIC
		},
		{
			path: ["db", "students", s.id, "Address"],
			value: info.Address
		}
	]))
	.reduce((agg, curr) => {
		return [
			...agg,
			...curr
		]
	}, [])

	dispatch(createMerges(siblingMerges))

}

export const markFaculty = (faculty: MISTeacher, date: string, status: MISTeacherAttendanceStatus, time = moment.now()) => (dispatch: Function) => {
	console.log('mark faculty', faculty, 'as', status);

	dispatch(createMerges([
		{
			path: ["db", "faculty", faculty.id, "attendance", date, status],
			value: time
		}
	]))
}

export const undoFacultyAttendance = (faculty: MISTeacher, date: string) => (dispatch: Function) => {
	dispatch(createDeletes([
		{
			path:["db", "faculty", faculty.id, "attendance", date]
		}
	]))
} 

export const addPayment = (student: MISStudent, payment_id: string, amount: number, date = moment.now(), type: MISStudentPayment['type'] = "SUBMITTED", fee_id: string = undefined, fee_name = "Fee") => (dispatch: Function) => {

	if(amount === undefined || amount === 0) {
		return {};
	}
	dispatch(createMerges([
		{
			path: ["db", "students", student.id, "payments", payment_id],
			value: {
				amount,
				date,
				type,
				fee_id,
				fee_name
			}
		}
	]))

}

type PaymentAddItem = {
	student: MISStudent;
	payment_id: string;
} & MISStudentPayment

export const addMultiplePayments = (payments: PaymentAddItem[]) => (dispatch: Function) => {

	// payments is array of { student, payment_id, amount, date, type, fee_id, fee_name }

	const merges = payments.map(p => ({
		path: ["db", "students", p.student.id, "payments", p.payment_id],
		value: {
			amount: p.amount,
			date: p.date,
			type: p.type,
			fee_id: p.fee_id,
			fee_name: p.fee_name
		}
	}))

	dispatch(createMerges(merges));
}

export const addHistoricalPayment = (payment: historicalPayment, student_id: string) => (dispatch: Function) => {
	// paymnet = { amount_owed, amount_paid, amount_forgiven, date, name }

	const { amount_owed, amount_paid, amount_forgiven, date, name } = payment
	const merges = []

	if(amount_owed > 0) {
		merges.push(
		{
			path: ["db", "students", student_id, "payments", v4()],
			value: {
				type: "OWED",
				fee_name: name,
				amount: amount_owed,
				date
			}
		})
	}
	if(amount_paid > 0) {
		merges.push(	
		{
			path: ["db", "students", student_id, "payments", v4()],
			value: {
				type: "SUBMITTED",
				amount: amount_paid,
				date
			}
		})
	}

	if(amount_forgiven > 0) {
		merges.push(
		{
			path: ["db", "students", student_id, "payments", v4()],
			value: {
				type: "FORGIVEN",
				amount: amount_forgiven,
				date
			}
		})
	}

	dispatch(createMerges(merges))
}

export const addExpense = (amount: number, label: string, type: MISExpense["type"], category: MISExpense["category"], quantity: number, date: number, time = moment.now() ) => (dispatch: Function) => {

	const expense =  "MIS_EXPENSE"
	const id = v4()

	dispatch(createMerges([
		{
			path: [ "db", "expenses", id ],
			value: {
				expense,
				amount,
				label,
				type,
				category,
				quantity,
				date,
				time
			}
		}
	]))
}

export const addSalaryExpense = (id: string, amount: number, label: string, type: MISSalaryExpense["type"], faculty_id: string, date: number, advance: number, deduction: number, deduction_reason: string, category="SALARY", time = moment.now() ) => (dispatch: Function) => {

	const expense = "SALARY_EXPENSE"
	
	dispatch(createMerges([
		{
			path: [ "db", "expenses", id ],
			value: {
				expense,
				amount, 
				label, // Teacher name
				type, // PAYMENT_GIVEN or PAYMENT_DUE
				category, // SALARY
				faculty_id,
				deduction_reason,
				advance,
				deduction,
				date,
				time
			}
		}
	]))
}

interface ExpenseEditItem {
	[id: string]: { amount: number };
}

export const editExpense = (expenses: ExpenseEditItem) => (dispatch: Function, getState: () => RootReducerState) => {
	
	//expenses is object of key (id) and value { amount }
	
	const state = getState()

	const merges = Object.entries(expenses).reduce((agg, [id, { amount }]) => {
		return [...agg,
			{
				path:["db", "expenses", id ],
				value: {
					...state.db.expenses[id],
					amount
				}
			}
		]
	}, [])

	dispatch(createMerges(merges))

}

export const deleteExpense = (id: string) => (dispatch: Function) => {

	//Id of the expense to be deleted

	dispatch(createDeletes([
		{
			path: ["db", "expenses", id]
		}
	]))
}

type FeeAddItem  = MISStudentFee & {
	student: MISStudent; 
	fee_id: string;
}

export const addMultipleFees = (fees: FeeAddItem[]) => (dispatch: Function) => {
	
	// fees is an array of { student, fee_id, amount, type, period, name}
	
	const merges = fees.map(f => ({
		path: ["db","students", f.student.id, "fees", f.fee_id],
		value: {
			amount : f.amount,
			name : f.name,
			period: f.period,
			type: f.type
		}
	}))
	
	dispatch(createMerges(merges))
}

type SingleFeeItem =  MISStudentFee & {
	student_id: string;
	fee_id: string;
}

export const addFee = (student_fee: SingleFeeItem) => (dispatch: Function) => {

	// student_fee is an object contains MISStudentFee, student_id and fee_id
	const merges = [{
			path: ["db", "students", student_fee.student_id, "fees", student_fee.fee_id],
			value: {
				amount: student_fee.amount,
				name: student_fee.name,
				period: student_fee.period,
				type: student_fee.type
			}
		}]
	
	dispatch(createMerges(merges))
}

type FeeDeleteItem = {
	[id: string]: {
		student_id: string;
		paymentIds: string[];
	};
}

export const deleteMultipleFees = (students_fees: FeeDeleteItem) => (dispatch: Function) => {
	
	// students_fees is an object that contains fee id as key and object { student_id: string, payment_id: [] } as value
	const deletes = Object.entries(students_fees).reduce((agg, [fee_id, {student_id, paymentIds}]) =>{
		
		const pay_deletes = paymentIds.map(pid => ({ path: ["db", "students", student_id, "payments", pid]}))
		
		return [
			...agg, 
			{
				path: ["db","students", student_id, "fees", fee_id]
			},
			...pay_deletes
		]}, [])

	dispatch(createDeletes(deletes))
}

export const createTemplateMerges = (templates: RootDBState["sms_templates"]) => (dispatch: Function) => {

	dispatch(createMerges([
		{
			path: ["db", "sms_templates"],
			value: templates
		}
	]))
}

type Exam = MISExam & {
	student_marks: {
		[id: string]: MISStudentExam;
	};
}
export const mergeExam = (exam: Exam, class_id: string, section_id: string) => (dispatch: Function) => {

	// exam is
	// {id, name, subject, total_score, date, student_marks: {score, grade, remarks}}

	const {id, name, subject, total_score, date, student_marks} = exam;

	// make sure date is a unix timestamp

	const student_merges = Object.entries(student_marks)
		.reduce((agg, [student_id, student_mark]) => ([
			...agg,
			{
				path: ["db", "students", student_id, "exams", id ],
				value: {
					score: student_mark.score, 
					grade: student_mark.grade,
					remarks: student_mark.remarks
				}
			}
		]), [])

	dispatch(createMerges([
		{
			path: ["db", "exams", id],
			value: { id, name, subject, total_score, date, class_id, section_id }
		},
		...student_merges
	]))
}


export const removeStudentFromExam = (e_id: string, student_id: string) => (dispatch: Function) => {
	dispatch(createDeletes([
		{
			path:["db", "students", student_id, "exams", e_id ]
		}
	]))
}

export const deleteExam = ( students: string[], exam_id: string ) => (dispatch: Function) => {
	//students  is an array of student Id's

	const deletes = students.map(s_id => ({
		path:["db", "students", s_id, "exams", exam_id]
	}))
	
 	dispatch(createDeletes([
		{
			path: ["db", "exams", exam_id]
		},
		...deletes
	]))

}

export const logSms = (history: MISSMSHistory) => (dispatch: Function) => {
	
	//history is an object { date: "", type: "", count:"" }

  	dispatch(createMerges([
		{
			path: ["db", "analytics", "sms_history", v4() ],
			value : history
		}
	])) 
}

export const addTag = (students: MISStudent[], tag: string) => (dispatch: Function) => {
	//students is an array of single or multiple students
	//tag is the text od tag

	const merges = students.map(s => ({
		path: ["db", "students", s.id, "tags", tag],
		value : true
	}))

  	dispatch(createMerges(merges)) 
}


export const addLogo = (logo_string: string) => (dispatch: Function) => {
	//logo_string is a base64 string
	dispatch(createMerges([
		{
			path : ["db", "assets", "schoolLogo"],
			value: logo_string
		}
	]))
}

export const addDiary = (date: string, section_id: string, diary: MISDiary["section_id"]) => (dispatch: Function) => {

	const merges = Object.entries(diary)
		.map(([subject, homework]) => ({
			path: ["db", "diary", date, section_id, subject],
			value: homework
		}))

	dispatch(createMerges(merges))

}

export const editPayment = (payments: AugmentedMISPaymentMap) => (dispatch: Function) => {

	// payments is an object with id as key and value is { amount, fee_id } 
 	const merges = Object.entries(payments).reduce((agg, [p_id, {student_id, amount,fee_id}]) => {
		return [...agg,
			{
				path:["db", "students", student_id, "payments", p_id, "amount"],
				value: amount
			},
			{
				path:["db", "students", student_id, "fees", fee_id, "amount"],
				value: Math.abs(amount)
			}
		]
	}, [])
	dispatch(createMerges(merges))
}

export const issueCertificate = (type: string, student_id: string, faculty_id: string) => (dispatch: Function) => {
	const date = moment.now()
	console.log("IN ISSUE CERTIFCATE",
		type,
		faculty_id,
		date,
		student_id
	)
	
	dispatch(createMerges([{
		path: ["db", "students", student_id, "certificates", `${date}`],
		value: {
			type,
			faculty_id,
			date
		}
	}]))
}

export const resetTrial = (days: number = 7) => (dispatch: Function) => {
	const date = moment().subtract(days,"days")

	dispatch(createMerges([{
		path: ["db", "package_info", "date"],
		value: date
	}]))
}

export const markPurchased = () => (dispatch: Function) => {

	dispatch(createMerges([{
		path: ["db", "package_info", "paid"],
		value: true
	}]))
}

export const trackRoute = (route: string) => (dispatch: Function) => {	
	dispatch(analyticsEvent([
		{
			type: "ROUTE",
			meta: {
				route: route.split("/").splice(1)
			}
		}
	]))
}