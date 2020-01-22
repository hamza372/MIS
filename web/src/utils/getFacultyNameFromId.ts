const getFacultyNameFromId = (fid: string, faculty: RootDBState["faculty"]): string => {
    
    const teacher = faculty && faculty[fid] ? faculty[fid] : undefined
    const teacher_name = teacher && teacher.Name ? teacher.Name : ""
    
    return teacher_name
}

export default getFacultyNameFromId