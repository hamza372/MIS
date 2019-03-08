import Dynamic from '@ironbay/dynamic'
import moment from 'moment'
import { ReactHTML } from 'react';

export default class Former {

	_component : React.Component<any, any, any>;
	base_path : Array<string>;

	constructor(_component : React.Component<any, any, any>, base_path : Array<string>) {

		this._component = _component;
		this.base_path = base_path;

	}

	handle(path : Array<string>, validate = (x : any) => true, cb = () => {}) {

		return (e : React.ChangeEvent<HTMLInputElement>) => {
			const value = this._getValue(e);
			const full_path = [...this.base_path, ...path]
			if(validate(value)) {
				this._component.setState((state : any) => Dynamic.put(state, full_path, value));
			}
		}
	}

	super_handle(path : Array<string>, validate = (x : any) => true, cb = () => { }) {
		const full_path = [...this.base_path, ...path];
		
		return {
			onChange: (e : React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
				const value = this._getValue(e);
				if(validate(value)) {
					this._component.setState((state : any) => Dynamic.put(state, full_path, value), cb)
				}
			},
			value: Dynamic.get(this._component.state, full_path) as string,
			checked: Dynamic.get(this._component.state, full_path) as boolean
		}
	}

	_getValue(event : React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {

		if(isChecked(event)) {
			return event.target.checked;
		}

		if(event.target.type === "date") {
			return moment(event.target.value, "YYYY-MM-DD").unix() * 1000;
		}

		return event.target.value;
	}
}

const isChecked = (event : React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): event is React.ChangeEvent<HTMLInputElement> => {
	return (<React.ChangeEvent<HTMLInputElement>>event).target.type === "checkbox"
}