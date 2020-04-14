interface FormQuestions {
	question: string
	options?: string[]
}

const EnglishQuestions: FormQuestions[] = [
	{
		question: "Is the student an orphan?",
		options: [
			"true",
			"No"
		]
	},
	{
		question: "Please select the reason behind their financial unstable condition:",
		options: [
			"They were financially unstable even before the outbreak of Corona.",
			"Their income is affected because of Corona."
		]
	},
	{
		question: "How many people earn in this household?",
	},
	{
		question: "Please select the source of income:",
		options: [
			"Job (Govt. sector)",
			"Job (Private sector)",
			"Business - small shop/restaurant/auto-rickshaw/",
			"Farming",
			"Cattle/poultry",
			"Other"
		]
	},
	{
		question: "(If select job (govt. Or private) please select occupation type:",
		options: [
			"Teacher/Admin in school", 
			"Janitorial staff - peon/guard etc. in school",
			"Doctor",
			"Nurse",
			"Police",
			"Other"
		]
	},
	{
		question: "Please select school",
		options: [
			"In this school",
			"In other school"
		]
	},
	{
		question: "Are they getting any donation from given options?",
		options: [
			"Govt.",
			"Relatives or village",
			"Other organizations",
			"The did not receive any donation"
		]
	},
	{
		question: "",
		options: []
	}
]

const UrduQuestions: FormQuestions[] = [
	{
		question: "",
		options: ["", "", ""]
	}
]

export const getNeedinessFormQuestions = (type: "en" | "ur") => {
	return type === "en" ? EnglishQuestions : UrduQuestions
}