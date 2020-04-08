type Tutorial = {
	[url: string]: {
		title: string
		link: string
	}
}

export const TutorialLinks: Tutorial = {
	"DEFAULT": {
		title: "Brief Introduction to MISchool",
		link: "https://www.youtube.com/embed/SHnVsuqp6G8?controls=0"
	},
	"SCHOOL-LOGIN": {
		title: "School Login",
		link: "https://www.youtube-nocookie.com/embed/4TymLLhu4GM?controls=0"
	},
	"LOGIN": {
		title: "Staff Login",
		link: "https://www.youtube-nocookie.com/embed/4TymLLhu4GM?controls=0"
	},
	"LANDING": {
		title: "Brief Intro to MIS Modules",
		link: "https://www.youtube-nocookie.com/embed/swWEOW3OGRU?controls"
	},
	"TEACHER": {
		title: "",
		link: ""
	},
	"STUDENT": {
		title: "Manage Students",
		link: "https://www.youtube.com/embed/NAqU1p5hLz0?controls=0"
	},
	"SMS": {
		title: "SMS Service",
		link: "https://www.youtube.com/embed/0NdzVoYSKEM?controls=0"
	},
	"CLASS": {
		title: "",
		link: ""
	},
	"SETTINGS": {
		title: "Manage Settings",
		link: "https://www.youtube-nocookie.com/embed/XTVruJ8ES7I?controls=0"
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
		title: "Student Attendance",
		link: "https://www.youtube.com/embed/QRhHYU2jTt8?controls=0"
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
		title: "Manage Exams & Tests",
		link: "https://www.youtube-nocookie.com/embed/h5zBuyQeW2w?controls=0"
	},
	"REPORTS-MENU": {
		title: "Manage Result Card",
		link: "https://www.youtube-nocookie.com/embed/jy4zYo74nQk?controls=0"
	},
	"FEE-MENU": {
		title: "Manage Student Fees",
		link: "https://www.youtube-nocookie.com/embed/8zyh6Z_Wl-U?controls=0"
	},
	"FEES": {
		title: "Manage Student Fees",
		link: "https://www.youtube-nocookie.com/embed/8zyh6Z_Wl-U?controls=0"
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