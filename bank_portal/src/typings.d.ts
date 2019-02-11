declare module "*.json" {
	const value: any;
	export default value;
}

declare module 'deck.gl' {
	const value: any;
	export const ScatterplotLayer: any;
	export default value;
}

interface RootBankState {
	selected?: SchoolLocation,
	filter_text: string,

	school_locations: {
		[school_id: string]: SchoolLocation
	},
	school_db: {
		[school_id: string]: PMIUSchool
	},
	new_school_db: {
		[school_id: string]: any
	},
	sync_state: {
		matches: {
			[school_id : string]: {
				status: "NEW" | "IN_PROGRESS" | "REJECTED" | "DONE",
				masked_number?: string
			}
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
		client_type: "bank_portal"
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