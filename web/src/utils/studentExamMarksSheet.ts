import calculateGrade from 'utils/calculateGrade'
type AugmentedExams = MISStudentExam & MISExam
type MergeStudentsExams = MISStudent & { merge_exams: AugmentedExams []}

const getStudentExamMarksSheet = (students: MergeStudentsExams[], grades: MISSettings["exams"]["grades"]) => {
    
    if(students.length === 0)
        return []

    const marks_sheet = students
        .reduce((agg, curr) => {

            let temp_marks = { total: 0, obtained: 0 }
            /**
             *  check the relevant exam exists in student.exams, if exists create a new object
             *  with all information of relevant exam from this.props.exams and also containing
             * 	student.exam {score, remarks, grades} and add to new_exams array
             * 	
             * 	if the relevant exam doesn't exist in student.exams, create a new object with all information
             * 	of relevant exam from this.props.exams and stats, containing default stats : {score: 0, remarks: "", grade: ""} 
             * 	which is make sure, if a student didn't attempt the exam so that he must have default value to avoid calculations
             * 	error or property accessing issues while printing record of student
             */
            for (const exam of curr.merge_exams) {
                temp_marks.obtained += parseFloat(exam.score.toString() || '0')
                temp_marks.total += parseFloat(exam.total_score.toString() || '0')
            }

            const grade = calculateGrade(temp_marks.obtained, temp_marks.total, grades)
            const remarks = grade && grades && grades[grade] ? grades[grade].remarks : ""

            return [
                ...agg,
                {
                    id: curr.id,
                    name: curr.Name,
                    manName: curr.ManName,
                    rollNo: curr.RollNumber ? curr.RollNumber : "",
                    marks: temp_marks,
                    position: 0,
                    merge_exams: curr.merge_exams,
                    grade,
                    remarks
                } as StudentMarksSheet
            ]
        }, [] as StudentMarksSheet[])
    .sort((a, b) => b.marks.obtained - a.marks.obtained)

    return marks_sheet
}

export default getStudentExamMarksSheet