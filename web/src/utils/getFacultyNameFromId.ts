const getFacultyNameFromId = (fid: string, faculty: RootDBState["faculty"]): string => {

    return faculty && faculty[fid] && faculty[fid].Name ? faculty[fid].Name : ""
}

export default getFacultyNameFromId