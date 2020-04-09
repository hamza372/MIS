interface Team {
	name: string
	avatar_url: string
	designation: string
	district?: string
	phone?: string
}

const TeamMembers: Array<Team> = [
	{
		name: "Asim Khwaja",
		avatar_url: "/images/asim.jpg",
		designation: "Principle Investigator"
	},
	{
		name: "Maroof Syed",
		avatar_url: "/images/maroof.jpg",
		designation: "President & CEO, CERP"
	},
	{
		name: "Zainab Qureshi",
		avatar_url: "/images/zainab.jpg",
		designation: "LEAPS Sr. Program Manager"
	},
	{
		name: "Taimur Shah",
		avatar_url: "images/taimur.jpg",
		designation: "Technology Lead"
	},
	{
		name: "Ayesha Ahmed",
		avatar_url: "/images/ayesha.jpg",
		designation: "Research Assistant"
	},
	{
		name: "Ali Ahmad",
		avatar_url: "/images/ali_ahmad.jpg",
		designation: "Senior Developer"
	},
	{
		name: "Mudassar Ali",
		avatar_url: "/images/mudassar.jpg",
		designation: "Developer",
	},
	{
		name: "Bisma Hafeez",
		avatar_url: "/images/bisma.jpg",
		designation: "Call Center Assistant",
		phone: "+923481112004"
	},
	{
		name: "Farooq Azhar",
		avatar_url: "/images/farooq_azhar.jpg",
		designation: "Area Manager",
		district: "Sialkot",
		phone: "+923410924945"
	},
	{
		name: "Kamran Anwar",
		avatar_url: "/images/kamran.jpg",
		designation: "Area Manager",
		district: "Faisalabad",
		phone: "+923460089864"
	},
	{
		name: "Zahid Riaz",
		avatar_url: "/images/zahid.jpg",
		designation: "Area Manager",
		district: "Gujranwala",
		phone: "+923460089862"
	},
	{
		name: "Nouman",
		avatar_url: "/images/nouman.jpg",
		designation: "Area Manager",
		district: "Islamabad & Rawalpindi",
		phone: "+923460089863"
	},
	{
		name: "Ali Zohaib",
		avatar_url: "/images/ali_zohaib.jpg",
		designation: "Area Manager",
		district: "Lahore, Kasur & Sheikhupura",
		phone: "+923410924944"
	},
	{
		name: "M. Farooq",
		avatar_url: "/images/m_farooq.jpg",
		designation: "Sales Assistant",
		district: "Faisalabad",
		phone: "+923474604333"
	}
]

export const getTeamMembersInfo = () => TeamMembers