"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dynamic_1 = __importDefault(require("@ironbay/dynamic"));
const moment_1 = __importDefault(require("moment"));
class Former {
    // if I change conditions to an object, i can specify conditions with path key
    // but what if the path is more than length 1, i can come up with my own id. but that is annoying.
    // that lets me do former.conditions(["thing"]) && <div className="row">....</div>
    // how to improve that more - why write the path 2 times
    constructor(_component, base_path, conditions) {
        this._component = _component;
        this.base_path = base_path;
        this._conditions = conditions || [];
    }
    check(path) {
        const path_key = path.join("-*-");
        const conds = this._conditions.filter(x => x.path.length === path.length && x.path.join("-*-") == path_key);
        return conds.reduce((agg, curr) => this._checkCond(curr) && agg, true);
    }
    _checkCond(cond, state = this._component.state) {
        // cond.depends is no longer a list of all the things that need to be true (list of AND)
        // there can now be an OR in between two entries.
        // so we need to do a look-ahead? or keep a stack on the side to eval expressions
        // we require list to be in prefix notation so we dont need to worry about parenthesis 
        const { runner: runner, exprStack: exprStack } = cond.depends.reduce((agg, curr) => {
            if (agg.exprStack.length > 0 && agg.exprStack.length < 3) {
                return {
                    exprStack: [...agg.exprStack, curr],
                    runner: agg.runner
                };
            }
            if (curr === "OR") {
                return {
                    exprStack: [curr], runner: agg.runner
                };
            }
            if (agg.exprStack.length === 3) {
                // first one will be "OR"
                const condA = agg.exprStack[1];
                const condB = agg.exprStack[2];
                if (condA === undefined || condB === undefined) {
                    alert("survey condition is undefined");
                    return {
                        exprStack: agg.exprStack,
                        runner: agg.runner
                    };
                }
                // check validity of both
                const condA_val = dynamic_1.default.get(state, [...this.base_path, ...condA.path]) == condA.value;
                const condB_val = dynamic_1.default.get(state, [...this.base_path, ...condB.path]) == condB.value;
                return {
                    exprStack: [],
                    runner: agg.runner && (condA_val || condB_val)
                };
            }
            return {
                runner: (agg.runner && dynamic_1.default.get(state, [...this.base_path, ...curr.path]) == curr.value),
                exprStack: []
            };
        }, { exprStack: [], runner: true });
        if (exprStack.length === 3) {
            const condA = exprStack[1];
            const condB = exprStack[2];
            // check validity of both
            const condA_val = dynamic_1.default.get(state, [...this.base_path, ...condA.path]) == condA.value;
            const condB_val = dynamic_1.default.get(state, [...this.base_path, ...condB.path]) == condB.value;
            return runner && (condA_val || condB_val);
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
    _setState(path, value, cb = () => { }) {
        // every time we set state, we check if any of the conditions we need are violated.
        // if they are then we snap back sections of state as specified in conditions
        // then we set state 
        let state_copy = JSON.parse(JSON.stringify(this._component.state));
        dynamic_1.default.put(state_copy, [...this.base_path, ...path], value);
        for (let cond of this._conditions) {
            const current = dynamic_1.default.get(state_copy, [...this.base_path, ...cond.path]);
            if (!this._checkCond(cond, state_copy) && current != cond.value) {
                console.log("snapping back", cond.path, "to value", cond.value);
                dynamic_1.default.put(state_copy, [...this.base_path, ...cond.path], cond.value);
            }
        }
        return this._component.setState((state) => state_copy);
    }
    handle(path, validate = (x) => true, cb = () => { }) {
        return (e) => {
            const value = this._getValue(e);
            if (validate(value)) {
                this._setState(path, value, cb);
            }
        };
    }
    super_handle(path, validate = (x) => true, cb = () => { }) {
        const full_path = [...this.base_path, ...path];
        return {
            onChange: (e) => {
                const value = this._getValue(e);
                if (validate(value)) {
                    this._setState(path, value, cb);
                }
            },
            value: dynamic_1.default.get(this._component.state, full_path),
            checked: dynamic_1.default.get(this._component.state, full_path)
        };
    }
    _getValue(event) {
        if (isChecked(event)) {
            return event.target.checked;
        }
        if (event.target.type === "date") {
            return moment_1.default(event.target.value, "YYYY-MM-DD").unix() * 1000;
        }
        return event.target.value;
    }
}
exports.default = Former;
const isChecked = (event) => {
    return event.target.type === "checkbox";
};
