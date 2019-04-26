
export const getGenderSpecificText = (word: string, gender: string) => {
	switch(word){
	  case "son/daughter":
		return gender ? gender === "male" ? "son" : "daughter" : "his/daughter"
	  case "he/she":
		return gender ? gender === "male" ? "he" : "she" : "he/her"
	  case "his/her":
		return gender ? gender === "male" ? "his" : "her" : "his/her"
	  case "him/her":
		return gender ? gender === "male" ? "him" : "her" : "him/her"
	}
  }

  export default getGenderSpecificText