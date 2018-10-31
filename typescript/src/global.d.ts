import { Moment } from "moment";

interface MIState {
	client_id: string,
	queued: any,
	acceptSnapshot: boolean,
	db: MIDB,
	auth: {
		school_id?: string,
		faculty_id?: string,
		token?: string,
		username?: string,
		attempt_failed: boolean,
		loading: boolean
	},
	connected: boolean
}

interface MIDB {
	faculty: Object,
	users: Object,
	students: Object,
	classes: Object,
	sms_templates: Object
}

declare enum Gender {
	Male = "male",
	Female = "female"
}

interface Faculty {
	Name: string,
	CNIC: string,
	Gender: Gender,
	Username: string,
	Password: string,
	Married: boolean,
	Phone: string,
	Salary: Number,
	Active: boolean,

	ManCNIC: string,
	ManName: string,
	Birthdate: number, /// should be a timestamp but it isn't right now.

}