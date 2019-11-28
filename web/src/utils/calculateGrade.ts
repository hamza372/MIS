/*
 *  description: takes marks obtained, total marks and grades from settings and returns the expected grade
 * 
 *  params: marks_obtained, total_marks, grades
 *  return: grade
 */

const calculateGrade = (marks_obtained: number, total_marks: number, grades: MISSettings["exams"]["grades"]): string => {

    const percent_score = Math.abs(( marks_obtained / total_marks) * 100)

    const sorted_grades = Object.entries(grades).sort((a, b)=> parseFloat(b[1]) - parseFloat(a[1]))

    let prev_grade: number = 0
    let grade: string

    const highest_grade = sorted_grades[0]

    for(const e of sorted_grades)
    {
        if(prev_grade !== 0 && percent_score >= parseFloat(highest_grade[1])){
            grade = highest_grade[0]
            break
        }
        else if(prev_grade !== 0 && percent_score <= prev_grade && percent_score >= parseFloat(e[1])){
            grade = e[0]
            break
        }
        else {
            prev_grade = parseFloat(e[1])
        }
    }
    
    // returning calculated  grade
    return grade
}
export default calculateGrade