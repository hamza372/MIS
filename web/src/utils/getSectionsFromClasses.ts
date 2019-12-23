export const getSectionsFromClasses = (classes: RootDBState['classes']) => {

	const sections: AugmentedSection[] = Object.values(classes)
		.reduce((agg, c) => {
			// each section
			return [...agg, ...Object.entries(c.sections)
				.reduce((agg2, [id, section], i, arr) => {
					return [
						...agg2,
						{
							id,
							class_id: c.id,
							namespaced_name: arr.length === 1 && section.name === "DEFAULT" ? c.name : `${c.name}-${section.name}`,
							className: c.name,
							classYear: c.classYear,
							...section
						}
					]
				}, [])]
		}, [])

		return sections;
}

export default getSectionsFromClasses;