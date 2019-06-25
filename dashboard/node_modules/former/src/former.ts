import Dynamic from '@ironbay/dynamic'
import moment from 'moment'
import * as React from 'react'

interface ConditionItem {
	path: Array<string>
	value: any
	depends: Array<Spec | "OR">
}

interface Spec {
	path: Array<string>
	value: any
}

export default class Former {

	_component : React.Component<any, any, any>;
	base_path : Array<string>;
	_conditions : ConditionItem[] 
	
	// if I change conditions to an object, i can specify conditions with path key
		// but what if the path is more than length 1, i can come up with my own id. but that is annoying.
	// that lets me do former.conditions(["thing"]) && <div className="row">....</div>
	// how to improve that more - why write the path 2 times

	constructor(_component : React.Component<any, any, any>, base_path : Array<string>, conditions?: ConditionItem[]) {

		this._component = _component;
		this.base_path = base_path;

		this._conditions = conditions || [];
	}

	check(path : Array<string>) {

		const path_key = path.join("-*-")

		const conds = this._conditions.filter(x => x.path.length === path.length && x.path.join("-*-") == path_key)

		return conds.reduce((agg, curr) => this._checkCond(curr) && agg, true)
	}
	
	_checkCond(cond : ConditionItem, state = this._component.state){

		// cond.depends is no longer a list of all the things that need to be true (list of AND)
		// there can now be an OR in between two entries.
		// so we need to do a look-ahead? or keep a stack on the side to eval expressions
		// we require list to be in prefix notation so we dont need to worry about parenthesis 

		/*
			(condA or condB) and condC
			[
				"OR",
				{ condA },
				{ condB },
				{ condC }
			]

			(condA or condB) and (condC or condD)
			[
				"OR"
				condA,
				condB,
				"OR",
				condC
				condD
			]

			((condA or condB) and condC) or condD // if there is an OR


			in the reduce we see an OR so we push it onto the expr stack. if expr stack has length > 0 and length < 3 then we push cond onto the stack.
			if length == 3, we evaluate the stack. we can do this because there are only 2 operators, and one is the default (AND)
			NOT is not supported now
		*/
		type ExprStack = ["OR"?, Spec?, Spec?]
		const { runner: runner, exprStack: exprStack } = cond.depends.reduce((agg, curr) => {

			if(agg.exprStack.length > 0 && agg.exprStack.length < 3) {
				return { 
					exprStack: [...agg.exprStack, curr as Spec] as ExprStack,  // this "as" should not be necessary but the compiler is complaining.
					runner: agg.runner 
				}
			}

			if(curr === "OR") {
				return {
					exprStack: [curr] as ExprStack, runner: agg.runner
				}
			}

			if(agg.exprStack.length === 3) {
				// first one will be "OR"
				const condA = agg.exprStack[1]
				const condB = agg.exprStack[2]

				if(condA === undefined || condB === undefined) {
					alert("survey condition is undefined")
					return {
						exprStack: agg.exprStack,
						runner: agg.runner
					}
				}

				// check validity of both
				const condA_val = Dynamic.get(state, [...this.base_path, ...condA.path]) == condA.value
				const condB_val = Dynamic.get(state, [...this.base_path, ...condB.path]) == condB.value

				return { 
					exprStack: [] as ExprStack, 
					runner: agg.runner && (condA_val || condB_val)
				}
			}

			return { 
				runner: (agg.runner && Dynamic.get(state, [...this.base_path, ...curr.path]) == curr.value),
				exprStack: [] as ExprStack
			}

		}, { exprStack: [] as ExprStack, runner: true })

		if(exprStack.length === 3) {
			const condA = exprStack[1] as Spec
			const condB = exprStack[2] as Spec

			// check validity of both
			const condA_val = Dynamic.get(state, [...this.base_path, ...condA.path]) == condA.value
			const condB_val = Dynamic.get(state, [...this.base_path, ...condB.path]) == condB.value

			return runner && (condA_val || condB_val)
		}

		return runner;

		/*
		return cond.depends.some(x => {
				const dep_current = Dynamic.get(state, [...this.base_path, ...x.path]) 
				console.log("current: ", dep_current, "should be", x.value )
				return dep_current == x.value
			})
		*/
	}

	_setState(path : Array<string>, value : any, cb = () => {}) {

		// every time we set state, we check if any of the conditions we need are violated.
		// if they are then we snap back sections of state as specified in conditions
		// then we set state 

		let state_copy = JSON.parse(JSON.stringify(this._component.state))
		Dynamic.put(state_copy, [...this.base_path, ...path], value)

		for(let cond of this._conditions) {
			const current = Dynamic.get(state_copy, [...this.base_path, ...cond.path])
			if(!this._checkCond(cond, state_copy) && current != cond.value) {
				console.log("snapping back", cond.path, "to value", cond.value)
				Dynamic.put(state_copy, [...this.base_path, ...cond.path], cond.value)
			}
		}

		return this._component.setState((state : any) => state_copy)
	}

	handle(path : Array<string>, validate = (x : any) => true, cb = () => {}) {

		return (e : React.ChangeEvent<HTMLInputElement>) => {
			const value = this._getValue(e);
			if(validate(value)) {
				this._setState(path, value, cb)
			}
		}
	}

	super_handle(path : Array<string>, validate = (x : any) => true, cb = () => { }) {
		const full_path = [...this.base_path, ...path];
		
		return {
			onChange: (e : React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
				const value = this._getValue(e);
				if(validate(value)) {
					this._setState(path, value, cb)
				}
			},
			value: Dynamic.get(this._component.state, full_path) as string,
			checked: Dynamic.get(this._component.state, full_path) as boolean
		}
	}

	_getValue(event : React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {

		if(isChecked(event)) {
			return event.target.checked;
		}

		if(event.target.type === "date") {
			return moment(event.target.value, "YYYY-MM-DD").unix() * 1000;
		}

		return event.target.value;
	}
}

const isChecked = (event : React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): event is React.ChangeEvent<HTMLInputElement> => {
	return (<React.ChangeEvent<HTMLInputElement>>event).target.type === "checkbox"
}