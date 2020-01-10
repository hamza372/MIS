import getSectionsFromClasses from "./getSectionsFromClasses"

const getSectionFromId = (section_id: string, classes: RootDBState["classes"]): AugmentedSection => {
    
    const sections = getSectionsFromClasses(classes)
    const section = sections.find(section => section.id === section_id)
    
    return section
}

export default getSectionFromId