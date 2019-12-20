import React, { Component } from 'react'

import { RouteComponentProps } from 'react-router'
import Layout from 'components/Layout'
import Former from 'utils/former'
import { connect } from 'react-redux'
import { mergeSettings } from 'actions'

import './style.css'

interface P {
    classes: RootDBState["classes"]
    settings: RootDBState["settings"]

    mergeSettings: (settings: RootDBState["settings"]) => void
}

interface S {
    selected_class_id: string
    disabled: boolean
    fee: MISStudentFee
}

type propsType = RouteComponentProps & P

const defaultFee = {
	name: "",
	type: "FEE",
	amount: "",
	period: "MONTHLY"
} as MISStudentFee

class ClassSettings extends Component<propsType, S> {
    
    former: Former
    constructor(props: propsType){
        super(props)

        this.state = {
            fee: {
                name: "",
                type: "FEE",
                amount: "",
                period: "MONTHLY"
            },
            selected_class_id: "",
            disabled: true
        }

        this.former = new Former(this, [])
    }

    onSectionChange = (): void => {
        
        const settings = this.props.settings
        const class_id = this.state.selected_class_id
        if(settings.classes) {
            
            const default_fee = settings.classes.defaultFee[class_id] || defaultFee

            this.setState({
                fee: default_fee
            })
        }
    }

    checkFieldsFill = (): void => {
        
        const amount = this.state.fee.amount.trim()
        const name = this.state.fee.name.trim()

        if(amount.length > 0 && name.length > 0 && this.state.selected_class_id !=="") {
            this.setState({ disabled: false })
        } else {
            this.setState({ disabled: true })
        }
    }

    Save = (): void => {
        const amount = parseFloat(this.state.fee.amount)
        const settings = this.props.settings
        const class_id = this.state.selected_class_id
        
        let modified_settings: MISSettings
        
        if(isNaN(amount)){
            alert("Please enter valid amount")
            return
        }

		if(settings.classes) {
			modified_settings = {
				...settings,
				classes: {
					...settings.classes,
					defaultFee: {
						...settings.classes.defaultFee,
						[class_id]: {
                            ...this.state.fee,
                            name: this.state.fee.name.trim(),
                            amount: Math.abs(amount).toString()
                        }
					}
				}
			}
		} else {
			modified_settings = {
				...settings,
				classes: {
					defaultFee: {
						[class_id]: {
                            ...this.state.fee,
                            name: this.state.fee.name.trim(),
                            amount: Math.abs(amount).toString() // fee must be absolute value
                        }
					}
				}
			}
		}

        // updating MISSettings
		this.props.mergeSettings(modified_settings)
    }

	render() {
        const { classes } = this.props

		return <Layout history={this.props.history}>
            <div className="class-settings">
                <div className="divider">Default Fee</div>
                    <div className="section form default-fee">
                        <div className="row">
                            <label>Class</label>
                            <select {...this.former.super_handle(["selected_class_id"], () => true, () => this.onSectionChange())}>
                                <option value="">Select Class</option>
                                {
                                    Object.values(classes)
                                        .sort((a, b) => a.classYear - b.classYear)
                                        .map((mis_class: MISClass) => 
                                            <option key={mis_class.id} value={mis_class.id}>
                                                {mis_class.name}
                                            </option>)
                                }                           
                            </select>
                        </div>
                    </div>
                    <div className="section form default-fee">
                        <div className="row">
                            <label>Type</label>
                            <input type="text" disabled value={this.state.fee.type} />
                        </div>
                        <div className="row">
                            <label>Name</label>
                            <input type="text" {...this.former.super_handle(["fee", "name"], () => true, () => this.checkFieldsFill())} placeholder="Enter Name" />
                        </div>
                        <div className="row">
                            <label>Amount</label>
                            <input type="number" {...this.former.super_handle(["fee", "amount"], () => true, () => this.checkFieldsFill())} placeholder="Enter Amount" />
                        </div>
                        <div className="row">
                            <label>Fee Period</label>
                            <input type="text" disabled value={ this.state.fee.period} />
                        </div>
                        
                        <div className="note-message"><span>Note:</span> This is default class fee (MONTHLY) which will be added to every newly created student</div>
                        
                        <div className={`button blue ${this.state.disabled ? 'disabled' : ''}`} onClick={ this.Save }>Set Default Fee </div>
                    </div>
			</div>
		</Layout>
	}
}
export default connect((state: RootReducerState ) => ({
	classes: state.db.classes,
	settings: state.db.settings
}), (dispatch: Function ) => ({
    mergeSettings: (settings: RootDBState["settings"]) => dispatch(mergeSettings(settings)),
}))(ClassSettings)