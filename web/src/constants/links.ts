type Tutorial = {
	[url: string]: {
		title: string
		link: string
	}
}

export const TutorialLinks: Tutorial = {
	"DEFAULT": {
		title: "What is MISchool",
		link: "https://www.youtube.com/embed/QN6JzExvbw8?controls=0"
	},
	"SCHOOL-LOGIN": {
		title: "Brief Introduction to MISchool",
		link: "https://www.youtube.com/embed/SHnVsuqp6G8?controls=0"
	},
	"LOGIN": {
		title: "",
		link: ""
	},
	"LANDING": {
		title: "",
		link: ""
	},
	"TEACHER": {
		title: "",
		link: ""
	},
	"STUDENT": {
		title: "",
		link: ""
	},
	"SMS": {
		title: "",
		link: ""
	},
	"CLASS": {
		title: "",
		link: ""
	},
	"SETTINGS": {
		title: "",
		link: ""
	},
	"HELP": {
		title: "",
		link: ""
	},
	"CERTIFICATE-MENU": {
		title: "",
		link: ""
	},
	"FAMILIES": {
		title: "",
		link: ""
	},
	"ATTENDANCE": {
		title: "",
		link: ""
	},
	"TEACHER-ATTENDANCE": {
		title: "",
		link: ""
	},
	"DIARY": {
		title: "",
		link: ""
	},
	"REPORTS": {
		title: "",
		link: ""
	},
	"REPORTS-MENU": {
		title: "",
		link: ""
	},
	"FEE-MENU": {
		title: "",
		link: ""
	},
	"DATESHEET": {
		title: "",
		link: ""
	},
	"ANALYTICS": {
		title: "",
		link: ""
	},
	"EXPENSE": {
		title: "",
		link: ""
	},
}

export const getLinkForPath = (pathname: string) => {

	const path = pathname.split("/")[1].toUpperCase()

	const title = TutorialLinks[path] && TutorialLinks[path].title ? TutorialLinks[path].title : TutorialLinks["DEFAULT"].title
	const link = TutorialLinks[path] && TutorialLinks[path].title ? TutorialLinks[path].link : TutorialLinks["DEFAULT"].link

	return { title, link }
}