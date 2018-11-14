
export const getSectionsFromClasses = (classes) => {

	const sections = Object.values(classes)
		.reduce((agg, c) => {
			// each section
			return [...agg, ...Object.entries(c.sections)
				.reduce((agg2, [id, section]) => {
					return [
						...agg2,
						{
							id,
							class_id: c.id,
							namespaced_name: `${c.name}-${section.name}`,
							className: c.name,
							...section
						}
					]
				}, [])]
		}, [])

		return sections;
}
