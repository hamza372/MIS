
const debounce = (f : Function, wait : number) : Function => {

	let timeout : NodeJS.Timeout;

	return (...args : any[]) => {
		const fncall = () => f.apply(this, args);

		clearTimeout(timeout);
		timeout = setTimeout(fncall, wait);
	}

}

export default debounce;