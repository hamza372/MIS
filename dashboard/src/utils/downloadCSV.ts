import Papa from 'papaparse'

const downloadCSV = (school_data: any, fields: string[], filename = "sample_csv") => {

	let csv = Papa.unparse({ data: school_data, fields: fields})

	const hiddenElem = document.createElement("a")
	hiddenElem.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv)
	hiddenElem.target = '_blank'
	hiddenElem.download = `${filename}.csv`
	hiddenElem.click()
}

export default downloadCSV