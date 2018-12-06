import Dynamic from '@ironbay/dynamic'

// return false if every field is not blank
// return an array of labels that are blank
export const checkCompulsoryFields = (obj,fields) =>{	

	console.log(fields);
	const filteredList = Object.values(fields.filter( field => Dynamic.get(obj,field) === "" ));

	console.log("filtered list",filteredList , "length", filteredList.length)

	return filteredList.length === 0 ? false : filteredList;

}


export default checkCompulsoryFields;