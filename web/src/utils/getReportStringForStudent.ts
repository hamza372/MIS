import moment from "moment"
import calculateGrade from "./calculateGrade"

const getReportStringForStudent = (student: MergeStudentsExams, exam_title: string, grades: RootDBState["settings"]["exams"]["grades"]): string => {

	let marks = { total: 0, obtained: 0 }

	for (const exam of student.merge_exams) {
		marks.obtained += parseFloat(exam.stats.score.toString() || '0')
		marks.total += parseFloat(exam.total_score.toString() || '0')
	}

	const subject_marks = student.merge_exams
		.sort((a, b) => a.date - b.date)
		.map(exam => `${moment(exam.date).format("MM/DD")} - ${exam.subject} ${exam.stats.score}/${exam.total_score} (${(exam.stats.score / exam.total_score * 100).toFixed(1)}%)`)

	const report_arr = [
		...subject_marks,
		`Total Marks: ${marks.obtained.toFixed(1)}/${marks.total.toFixed(1)}`,
		`Total Percentage: ${(marks.obtained / marks.total * 100).toFixed(1)}%`,
		`Grade: ${calculateGrade(marks.obtained, marks.total, grades)}`
	]

	if (exam_title !== "") {
		report_arr.unshift(exam_title)
	}

	return report_arr.join('\n');
}

export default getReportStringForStudent