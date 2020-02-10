const toTitleCase = (text: string) => {
    if(text == null || text === "") {
        return ""
    }
    return text.trim()
        .toLowerCase()
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');
}

export default toTitleCase