import calculateGrade from 'utils/calculateGrade'

const getStudentExamMarksSheet = (students: MergeStudentsExams[], grades: MISSettings["exams"]["grades"]): StudentMarksSheet[] => {

	if (students.length === 0)
		return []

	const marks_sheet = students
		.reduce<StudentMarksSheet[]>((agg, curr) => {

			let marks = { total: 0, obtained: 0 }

			for (const exam of curr.merge_exams) {
				marks.obtained += parseFloat(exam.stats.score.toString() || '0')
				marks.total += parseFloat(exam.total_score.toString() || '0')
			}

			const grade = calculateGrade(marks.obtained, marks.total, grades)
			const remarks = grade && grades && grades[grade] ? grades[grade].remarks : ""

			return [
				...agg,
				{
					id: curr.id,
					name: curr.Name,
					manName: curr.ManName,
					rollNo: curr.RollNumber ? curr.RollNumber : "",
					marks,
					position: 0,
					merge_exams: curr.merge_exams,
					grade,
					remarks
				} as StudentMarksSheet
			]
		}, [])
		.sort((a, b) => b.marks.obtained - a.marks.obtained)

	return marks_sheet
}

export default getStudentExamMarksSheet