interface Team {
	name: string
	avatar_url: string
	designation: string
	email?: string
	bio?: string
	district?: string
}

const TeamMembers: Array<Team> = [
	{
		name: "Taimur Shah",
		avatar_url: "https://labs.cerp.org.pk/public/taimur.jpg",
		designation: "Head CERP Labs",
	},
	{
		name: "Ayesha Ahmed",
		avatar_url: "",
		designation: "Research Associate",
	},
	{
		name: "Ali Ahmad",
		avatar_url: "https://labs.cerp.org.pk/public/Rao_Ali_Ahmad.jpg",
		designation: "Senior Developer",
	},
	{
		name: "Mudassar Ali",
		avatar_url: "https://labs.cerp.org.pk/public/mudassar.jpeg",
		designation: "Developer",
	},
	{
		name: "Bisma Hafeez",
		avatar_url: "",
		designation: "Call Center Assistant",
	},
	{
		name: "Kamran Anwar",
		avatar_url: "",
		designation: "Area Manager",
		district: "Faisalabad"
	},
	{
		name: "Farooq Azhar",
		avatar_url: "",
		designation: "Area Manager",
		district: "Sialkot"
	},
	{
		name: "Zahid",
		avatar_url: "",
		designation: "Area Manager",
		district: "Gujranwala"
	},
	{
		name: "Nouman",
		avatar_url: "",
		designation: "Area Manager",
		district: "Islamabad & Rawalpindi"
	},
	{
		name: "Ali Zohaib",
		avatar_url: "",
		designation: "Area Manager",
		district: "Lahore, Kasur & Sheikhupura"
	},
	{
		name: "M. Farooq",
		avatar_url: "",
		designation: "Area Manager Assistant",
		district: "Faisalabad"
	}
]

export const getTeamMembersInfo = () => TeamMembers