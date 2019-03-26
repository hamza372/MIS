declare module "*.json" {
	const value: any;
	export default value;
}

declare module 'deck.gl' {
	const value: any;
	export const ScatterplotLayer: any;
	export default value;
}

// could include "history" here or "timeline"
// with { [timestamp]: { event: 'number-revealed'}}
// then when things are added to a supplier from backend its already in sync_state
interface SchoolMatch {
	status: "NEW" | "IN_PROGRESS" | "REJECTED" | "DONE",
	masked_number?: string,
	history: {
		[timestamp: number]: SupplierInteractionEvent | CallEndEvent | CallEndSurvey
	}
}

interface PlatformInteractionEvent {
	event: string,
	time: number,
	user: {
		name: string,
		number: string
	}
}

interface CallEndEvent extends PlatformInteractionEvent {
	event: "CALL_END" | "CALL_BACK_END",
	meta: {
		call_status: "ANSWER" | "NO ANSWER" | "BUSY" | "CANCEL" | "FAILED" | "CONGESTION",
		duration: string,
		unique_id: string
	}
}

interface CallEndSurvey extends PlatformInteractionEvent {
	event: "CALL_END_SURVEY",
	meta: {
		customer_interest: "YES" | "NO" | "UNSURE" | ""
		reason_rejected: "PRODUCT_TOO_EXPENSIVE" | "PRODUCT_NOT_RELEVANT" | "PRODUCT_NOT_GOOD_ENOUGH" | "OTHER" | "",
		other_reason_rejected: string
		customer_likelihood: "HIGH" | "MEDIUM" | "LOW" | ""
		follow_up_meeting: "YES" | "NO" | "N/A" | ""
		other_notes: string,
		call_number: number
	}
}

interface NotInterestedSurvey extends PlatformInteractionEvent {
	event: "MARK_REJECTED_SURVEY"
	meta: {
		reason_rejected: String
	}
}

interface MarkCompleteSurvey extends PlatformInteractionEvent {
	event: "MARK_COMPLETE_SURVEY",
	meta: {
		reason_completed: "CLIENT_BOUGHT_PRODUCT" | "RELEASE_MASKED_NUMBER" | "HANDLING_OUTSIDE_PLATFORM" | "CLIENT_NOT_INTERESTED" | "CLIENT_NOT_REACHABLE" | "OTHER" | ""
		other_reason: String
	}
}

type SupplierInteractionEvent = {
	event: "MARK_REJECTED" | "REVEAL_NUMBER" | "MARK_DONE" | "CALL_START" | "CALL_BACK",
} & PlatformInteractionEvent


interface RootBankState {
	school_locations: {
		[school_id: string]: SchoolLocation
	},
	school_db: {
		[school_id: string]: PMIUSchool
	},
	new_school_db: {
		[school_id: string]: CERPSchool
	},
	sync_state: {
		matches: {
			[school_id : string]: SchoolMatch
		},
		numbers: {
			[number: string]: {
				name: string
			}
		},
		mask_pairs: {
			[masked_number: string]: {
				status: "USED" | "FREE",
				school_id?: string
			}
		}
	},
	auth: {
		id: string,
		token: string,
		username: string,
		attempt_failed: boolean,
		loading: boolean,
		client_type: "bank_portal",
		number: string
	},
	client_id: string,
	queued: {
		[path: string]: {
			action: {
				path: string[],
				value?: any,
				type: "MERGE" | "DELETE"
			}, 
			date: number 
		} 
	},
	last_snapshot: number,
	accept_snapshot: boolean,
	connected: boolean
}

interface CERPSchool {
	alt_number: string
	alt_phone_number: string
	call_answer_no: string
	call_back_time: string
	call_consent: string
	call_response: string
	date: string
	duration: string
	endtime: string
	enrolment_range: string
	enumerator_comments: string
	enumerator_id: string
	ess_current: string
	ess_current_0: string
	ess_current_1: string
	ess_current_2: string
	ess_current_3: string
	ess_current_4: string
	ess_current_5: string
	ess_current_6: string
	ess_current_7: string
	ess_current_all: string
	ess_interest: string
	ess_interest_0: string
	ess_interest_1: string
	ess_interest_2: string
	ess_interest_3: string
	ess_interest_4: string
	ess_interest_5: string
	ess_interest_6: string
	ess_interest_7: string
	ess_interest_all: string
	ess_satisfaction: string
	ess_satisfaction_0: string
	ess_satisfaction_1: string
	ess_satisfaction_2: string
	ess_satisfaction_3: string
	ess_satisfaction_all: string
	financing_interest: string
	financing_no_other: string
	financing_no_reason: string
	financing_no_reason_0: string
	financing_no_reason_1: string
	financing_no_reason_2: string
	financing_no_reason_3: string
	financing_no_reason_4: string
	financing_no_reason_5: string
	financing_no_reason_6: string
	financing_no_reason_8: string
	financing_no_reason_777: string
	formdef_version: string
	high_fee_range: string
	highest_fee: string
	highest_grade: string
	income_source: string
	instruction_medium: string
	key: string
	low_fee_range: string
	lowest_fee: string
	lowest_grade: string
	monthly_fee_collected: string
	no_of_rooms: string
	owner_phonenumber: string
	phone_number: string
	phone_number_1: string
	phone_number_2: string
	phone_number_3: string
	platform_interest: string
	platform_interest_no: string
	platform_interest_no_other: string
	platform_no_calling: string
	platform_no_internet: string
	platform_no_need: string
	previous_loan: string
	previous_loan_amount: string
	private_tuition: string
	pulled_address: string
	pulled_altnumber: string
	pulled_district: string
	pulled_phonenumber: string
	pulled_province: string
	pulled_schoolname: string
	pulled_tehsil: string
	pulled_uc: string
	refcode: string
	refusal_reason: string
	refusal_reason_0: string
	refusal_reason_1: string
	refusal_reason_2: string
	refusal_reason_3: string
	refusal_reason_777: string
	refusal_reason_other: string
	respondent_consent: string
	respondent_gender: string
	respondent_name: string
	respondent_owner: string
	respondent_relation: string
	respondent_relation_other: string
	school_address: string
	school_branches: string
	school_building_rent: string
	school_district: string
	school_district_confirm: string
	school_facilities: string
	school_facilities_0: string
	school_facilities_1: string
	school_facilities_2: string
	school_facilities_3: string
	school_facilities_4: string
	school_facilities_5: string
	school_facilities_6: string
	school_facilities_7: string
	school_facilities_8: string
	school_fef: string
	school_name: string 
	school_pef: string
	school_registration: string
	school_sef: string
	school_tehsil: string
	school_uc: string
	smart_phone: string
	starttime: string
	submissiondate: string
	switch_call: string
	switch_call_pos: string
	teachers_employed: string
	textbook_provider_interest: string
	textbook_publisher: string
	textbook_publisher_0: string
	textbook_publisher_1: string
	textbook_publisher_2: string
	textbook_publisher_3: string
	textbook_publisher_4: string
	textbook_publisher_5: string
	textbook_publisher_6: string
	textbook_publisher_7: string
	textbook_publisher_8: string
	textbook_publisher_9: string
	textbook_publisher_777: string
	textbook_publisher_other: string
	textbook_purchase_mode: string
	textbook_reason: string
	textbook_reason_0: string
	textbook_reason_1: string
	textbook_reason_2: string
	textbook_reason_3: string
	textbook_reason_777: string
	textbook_reason_other: string
	total_enrolment: string
	tuition_students: string
	tuition_teachers: string
	unmet_financing_needs: string
	wrong_number_detail: string
	wrong_number_detail_no: string
	wrong_number_detail_sc: string
	year_established: string

}

interface SchoolLocation {
	id: string
	SchoolName: string
	GPS_North: string
	GPS_East: string
}

interface PMIUSchool {
	id: string
	DistrictName: string
	TehsilName: string
	UCName: string
	VisitDate: string
	RefCode: string
	SchoolName: string
	SchoolMauza: string
	SchoolAddress: string
	PhoneNumber: string
	TotalAreaKanal: string
	TotalAreaMarla: string
	GPS_North: string
	GPS_East: string
	EstablishmentYear: string
	SchoolLocation: string
	SchoolLevel: string
	SchoolGender: string
	RegistrationStatus: string
	RegistrationNo: string
	BISEAffiliated: string
	BISEName: string
	SchoolCategory: string
	'School Category': string
	MediumOfInstruction: string
	NoOfClassRooms: string
	Fac_DrinkingWater: string
	Fac_BoundaryWall: string
	Fac_Electricity: string
	Fac_Toilet: string
	Fac_StaffRoom: string
	Fac_PlayGround: string
	Fac_UPSGenerator: string
	Fac_MultipurposeHall: string
	Fac_OfficeComputer: string
	Fac_ComputerLab: string
	Fac_ScienceLab: string
	Fac_Library: string
	Fac_Transport: string
	Fac_Hostel: string
	BuildingOwnership: string
	Enrolment_PN_Boys: string
	Enrolment_PN_Girls: string
	Enrolment_NU_Boys: string
	Enrolment_NU_Girls: string
	Enrolment_PR_Boys: string
	Enrolment_PR_Girls: string
	Enrolment_01_Boys: string
	Enrolment_01_Girls: string
	Enrolment_02_Boys: string
	Enrolment_02_Girls: string
	Enrolment_03_Boys: string
	Enrolment_03_Girls: string
	Enrolment_04_Boys: string
	Enrolment_04_Girls: string
	Enrolment_05_Boys: string
	Enrolment_05_Girls: string
	Enrolment_06_Boys: string
	Enrolment_06_Girls: string
	Enrolment_07_Boys: string
	Enrolment_07_Girls: string
	Enrolment_08_Boys: string
	Enrolment_08_Girls: string
	Enrolment_09S_Boys: string
	Enrolment_09A_Boys: string
	Enrolment_09S_Girls: string
	Enrolment_09A_Girls: string
	Enrolment_10S_Boys: string
	Enrolment_10A_Boys: string
	Enrolment_10S_Girls: string
	Enrolment_10A_Girls: string
	Enrolment_11S_Boys: string
	Enrolment_11A_Boys: string
	Enrolment_11S_Girls: string
	Enrolment_11A_Girls: string
	Enrolment_12S_Boys: string
	Enrolment_12A_Boys: string
	Enrolment_12S_Girls: string
	Enrolment_12A_Girls: string
	Enrolment_OLS_Boys: string
	Enrolment_OLA_Boys: string
	Enrolment_OLS_Girls: string
	Enrolment_OLA_Girls: string
	Enrolment_ALS_Boys: string
	Enrolment_ALA_Boys: string
	Enrolment_ALS_Girls: string
	Enrolment_ALA_Girls: string
	TeachingStaffMale: string
	TeachingStaffFemale: string
	NonTeachingStaffMale: string
	NonTeachingStaffFemale: string
	MultiGradeClassesClubbed: string
	TextBooksUsed: string
	TextBooksOtherName: string
	Teachers_FAFSC_Male: string
	Teachers_FAFSC_Female: string
	Teachers_BABSC_Male: string
	Teachers_BABSC_Female: string
	Teachers_MAMSC_Male: string
	Teachers_MAMSC_Female: string
	EnumeratorID: string
	EnumeratorName: string
}