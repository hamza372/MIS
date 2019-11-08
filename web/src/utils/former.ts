import Dynamic from '@ironbay/dynamic'
import moment from 'moment'

export default class Former {

	_component: React.Component<any, any, any>;
	base_path: Array<string>;

	constructor(_component: React.Component<any, any, any>, base_path: Array<string>) {

		this._component = _component;
		this.base_path = base_path;

	}

	handle(path: Array<string>, validate = (x: any) => true, cb = () => {}) {

		return (e: React.ChangeEvent<HTMLInputElement>) => {
			const value = this._getValue(e);
			const full_path = [...this.base_path, ...path]
			if(validate(value)) {
				this._component.setState((state: any) => Dynamic.put(state, full_path, value), cb);
			}
		}
	}

	super_handle(path: Array<string>, validate = (x: any) => true, cb = () => { }) {
		const full_path = [...this.base_path, ...path];
		
		return {
			onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
				const value = this._getValue(e);
				if(validate(value)) {
					this._component.setState((state: any) => Dynamic.put(state, full_path, value), cb)
				}
			},
			value: Dynamic.get(this._component.state, full_path) as string,
			checked: Dynamic.get(this._component.state, full_path) as boolean
		}
	}

	super_handle_flex = (path: string[], args: object) => {
		const default_args = {
			validate: (val: any) => true,
			cb: () => { },
			styles: (val: any) => ({ })
		}

		const { validate, cb, styles } = {...default_args, ...args}
		const full_path = [...this.base_path, ...path]


		return {
			onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
				const value = this._getValue(e)
				if(validate(value)) {
					this._component.setState((state: any) => Dynamic.put(state, full_path, value), cb)
				}
			},
			value: Dynamic.get(this._component.state, full_path) as string,
			style: styles(Dynamic.get(this._component.state, full_path)),
			checked: Dynamic.get(this._component.state, full_path) as boolean
		}
	}

	_getValue(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {

		if(isChecked(event)) {
			return event.target.checked;
		}

		if(event.target.type === "date") {
			return moment(event.target.value, "YYYY-MM-DD").unix() * 1000;
		}

		let val: string|boolean = event.target.value;

		if(val === "true") {
			val = true
		}

		if(val === "false") {
			val = false;
		}

		return val;
	}
}

const isChecked = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): event is React.ChangeEvent<HTMLInputElement> => {
	return (event as React.ChangeEvent<HTMLInputElement>).target.type === "checkbox"
}