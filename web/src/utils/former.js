import Dynamic from '@ironbay/dynamic'
import moment from 'moment'
// if a component has a form, it should include an instance of this class.
// using @ironbay/dynamic for manipulating deeply nested objects
// 
export default class Former {

	constructor(_component, base_path) {

		this._component = _component;
		this.base_path = base_path;

	}

	handle(path, cb = () => { }) {

		return e => {
			const value = this._getValue(e)
			const full_path = [...this.base_path, ...path]
			this._component.setState(state => Dynamic.put(state, full_path, value), cb)
		}
	}

	super_handle(path, cb = () => { }) {

		const full_path = [...this.base_path, ...path]

		return {
			onChange: e => {
				const value = this._getValue(e)
				this._component.setState(state => Dynamic.put(state, full_path, value), cb)
			},
			value: Dynamic.get(this._component.state, full_path),
			checked: Dynamic.get(this._component.state, full_path)
		}
	}

	_getValue(event) {
		if(event.target.type === "checkbox") {
			return event.target.checked;
		}

		if(event.target.type === "date") {
			return moment(event.target.value, "YYYY-MM-DD").unix() * 1000;
		}

		return event.target.value;
	}

}