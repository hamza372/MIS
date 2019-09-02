const downloadCSV = (data: String[][], name: string) => {

	const csv = data.reduce((agg, curr) => {
		return agg + curr.map(x => x.replace(/[^a-zA-Z0-9\(\)\/ ]/g, '')).join(",") + "\n"
	}, "")

	const hiddenElem = document.createElement("a")
	hiddenElem.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv)
	hiddenElem.target = '_blank'
	hiddenElem.download = `${name}.csv`
	hiddenElem.click();
}

export default downloadCSV;