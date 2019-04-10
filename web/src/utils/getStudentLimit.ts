
/**
 * prospective students
 * finished school
 * inactive students
 */

//return true if limit is reached else false
const getStudentLimt = (students: RootDBState["students"], max_limit: RootDBState["max_limit"]) : boolean => {

	const studentLength = Object.values(students)
		.filter(x => x.Name &&( x.Active && ( x.tags ? (!x.tags["PROSPECTIVE"] && !x.tags["FINISHED_SCHOOL"] ) : true )) 
		).length
	return max_limit >= 0 && studentLength >= max_limit
}

export default getStudentLimt