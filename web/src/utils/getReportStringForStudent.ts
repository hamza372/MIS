import moment from "moment"
import calculateGrade from "./calculateGrade"
type AugmentedExams = MISStudentExam & MISExam
type MergeStudentsExams = MISStudent & { merge_exams: AugmentedExams []}

const getReportStringForStudent = (student: MergeStudentsExams, exam_title: string, grades: RootDBState["settings"]["exams"]["grades"]) => {
	
	const { marks_obtained, total_marks } = student.merge_exams.reduce((agg, exam) => ({ 
        marks_obtained: agg.marks_obtained + parseFloat(student.exams[exam.id].score.toString() || '0'), 
        total_marks: agg.total_marks + parseFloat(exam.total_score.toString() || '0') }),
	{ marks_obtained: 0, total_marks: 0 })

	const report_arr= [
		student.merge_exams
			.sort((a, b) => a.date - b.date)
			.map(exam => `${moment(exam.date).format("MM/DD")} - ${exam.subject} ${student.exams[exam.id].score}/${exam.total_score} (${(student.exams[exam.id].score / exam.total_score * 100).toFixed(1)}%)`),
		`Total Marks: ${marks_obtained.toFixed(1)}/${total_marks.toFixed(1)}`,
        `Total Percentage: ${(marks_obtained/total_marks * 100).toFixed(1)}%`,
        `Grade: ${calculateGrade(marks_obtained, total_marks, grades)}`
		]
	
	if(exam_title !== "") {
		report_arr.unshift(exam_title)
	}
	
	return report_arr.join('\n');
}

export default getReportStringForStudent