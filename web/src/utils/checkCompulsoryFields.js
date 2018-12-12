import Dynamic from '@ironbay/dynamic'

// return false if every field is not blank
// return an array of labels that are blank
export const checkCompulsoryFields = (obj,fields) =>{	

	const filteredList = Object.values(fields.filter( field => Dynamic.get(obj,field) === "" ));
		return filteredList.length === 0 ? false : filteredList;

}
export default checkCompulsoryFields;