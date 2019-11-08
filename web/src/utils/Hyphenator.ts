
const Hyphenator = (str: string): string => {
	
	if(str.length <= 15)
	{	
		if(str.substring(5,6) !== "" && str.substring(5,6) !== "-")
			str = str.substr(0, 5) + "-" + str.substr(5);
		
		if(str.substring(13,14) !== "" && str.substring(13,14) !== "-")
			str = str.substr(0, 13) + "-" + str.substr(13);

		return str;
	}
}

export default Hyphenator;