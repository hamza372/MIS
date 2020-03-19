import calculateGrade from 'utils/calculateGrade'

export const getSingleStudentExamMarksSheet = (student: MergeStudentsExams, grades: MISSettings["exams"]["grades"]): StudentMarksSheet => {

	let marks = { total: 0, obtained: 0 }

	for (const exam of student.merge_exams) {
		marks.obtained += parseFloat(exam.stats.score.toString() || '0')
		marks.total += parseFloat(exam.total_score.toString() || '0')
	}

	const grade = calculateGrade(marks.obtained, marks.total, grades)
	const remarks = grade && grades && grades[grade] ? grades[grade].remarks : ""

	return {
		id: student.id,
		name: student.Name,
		manName: student.ManName,
		rollNo: student.RollNumber ? student.RollNumber : "",
		section_id: student.section_id,
		marks,
		position: 0,
		merge_exams: student.merge_exams,
		grade,
		remarks
	}
}

const getStudentExamMarksSheet = (students: MergeStudentsExams[], grades: MISSettings["exams"]["grades"]): StudentMarksSheet[] => {

	if (students.length === 0)
		return []

	const marks_sheet = students
		.reduce<StudentMarksSheet[]>((agg, curr) => {

			const marks_sheet = getSingleStudentExamMarksSheet(curr, grades)

			return [
				...agg,
				marks_sheet
			]
		}, [])
		.sort((a, b) => b.marks.obtained - a.marks.obtained)

	return marks_sheet
}

export default getStudentExamMarksSheet