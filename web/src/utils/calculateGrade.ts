/*
 *  description: takes marks obtained, total marks and grades from settings and returns the expected grade
 * 
 *  params: marks_obtained, total_marks, grades
 *  return: grade
 */

const calculateGrade = (marks_obtained: number, total_marks: number, grades: MISSettings["exams"]["grades"]): string => {

    const percent_score = Math.abs(( marks_obtained / total_marks) * 100)

    const sorted_grades = Object.entries(grades).sort((a, b) => parseFloat(b[1].percent) - parseFloat(a[1].percent))

    let previous_percent = 0
    let grade: string

    const highest_grade = sorted_grades[0]

    for(const curr of sorted_grades)
    {
        if(previous_percent !== 0 && percent_score >= parseFloat(highest_grade[1].percent)){
            grade = highest_grade[0]
            break
        }
        else if(previous_percent !== 0 && percent_score <= previous_percent && percent_score >= parseFloat(curr[1].percent)){
            grade = curr[0]
            break
        }
        else {
            previous_percent = parseFloat(curr[1].percent)
            grade = curr[0]
        }
    }
    
    // returning calculated  grade
    return grade
}
export default calculateGrade