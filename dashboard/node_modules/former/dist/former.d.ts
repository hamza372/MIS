import * as React from 'react';
interface ConditionItem {
    path: Array<string>;
    value: any;
    depends: Array<Spec | "OR">;
}
interface Spec {
    path: Array<string>;
    value: any;
}
export default class Former {
    _component: React.Component<any, any, any>;
    base_path: Array<string>;
    _conditions: ConditionItem[];
    constructor(_component: React.Component<any, any, any>, base_path: Array<string>, conditions?: ConditionItem[]);
    check(path: Array<string>): boolean;
    _checkCond(cond: ConditionItem, state?: Readonly<any>): boolean;
    _setState(path: Array<string>, value: any, cb?: () => void): void;
    handle(path: Array<string>, validate?: (x: any) => boolean, cb?: () => void): (e: React.ChangeEvent<HTMLInputElement>) => void;
    super_handle(path: Array<string>, validate?: (x: any) => boolean, cb?: () => void): {
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
        value: string;
        checked: boolean;
    };
    _getValue(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): string | number | boolean;
}
export {};
