import moment from 'moment'
import calculateGrade from 'utils/calculateGrade'

type ExamFilter = {
    exam_title: string
    year: string
}

const getStudentExamMarksSheet = (students: MISStudent[], section_exams: MISExam[], grades: MISSettings["exams"]["grades"], filter: ExamFilter) => {
    console.log("Students", students)
    const marks_sheet = students
        .reduce((agg, curr) => {

            let new_exams = []
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
            for (const exam of section_exams) {
                const stats = curr.exams[exam.id] || { score: 0, remarks: "", grade: "" }

                if(exam.name === filter.exam_title && moment(exam.date).format("YYYY") === filter.year) {
                    new_exams.push({ ...exam, stats })
                    temp_marks.obtained += parseFloat(stats.score.toString() || '0')
                    temp_marks.total += parseFloat(exam.total_score.toString() || '0')
                }
            }

            const grade = calculateGrade(temp_marks.obtained, temp_marks.total, grades)
            const remarks = grade && grades && grades[grade] ? grades[grade].remarks : ""

            return [
                ...agg,
                {
                    id: curr.id,
                    name: curr.Name,
                    roll: curr.RollNumber ? curr.RollNumber : "",
                    marks: temp_marks,
                    position: 0,
                    exams: new_exams,
                    grade,
                    remarks
                } as StudentMarksSheet
            ]
        }, [] as StudentMarksSheet[])
    .sort((a, b) => b.marks.obtained - a.marks.obtained)

    return marks_sheet
}

export default getStudentExamMarksSheet