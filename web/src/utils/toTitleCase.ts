const toTitleCase = (text: string, split_by?: string) => {
    if(text == null || text === "") {
        return ""
    }
    return text.trim()
        .toLowerCase()
        .split(split_by || ' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(split_by || ' ')
}

export default toTitleCase