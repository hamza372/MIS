import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import queryString from 'query-string'
import { getFilteredPayments } from 'utils/getFilteredPayments'
import { StudentLedgerPage } from './StudentLedgerPage'
import Layout from "components/Layout"
import moment from 'moment'
import getSectionFromId from 'utils/getSectionFromId'

interface P {
	classes: RootDBState["classes"]
	student: MISStudent
	faculty_id: RootReducerState["auth"]["faculty_id"]
	students: RootDBState["students"]
	settings: RootDBState["settings"]
	schoolLogo: string
}

interface RouteInfo {
	id: string
	famId: string
}

type propTypes = RouteComponentProps<RouteInfo> & P

class printPreview extends Component<propTypes>{

	month = (): string => queryString.parse(this.props.location.search).month.toString() || moment().format("MMMM")
	year = (): string => queryString.parse(this.props.location.search).year.toString() || moment().format("YYYY")

	studentID = (): string => this.props.match.params.id

	familyID = (): string => this.props.match.params.famId

	mergedPaymentsForStudent = () => {

		if (this.familyID() !== undefined) {
			const siblings = this.siblings()
			const merged_payments = siblings.reduce((agg, curr) => ({
				...agg,
				...Object.entries(curr.payments).reduce((agg, [pid, p]) => {
					return {
						...agg,
						[pid]: {
							...p,
							fee_name: p.fee_name && `${curr.Name}-${p.fee_name}`
						}
					}
				}, {} as MISStudent['payments'])
			}), {} as { [id: string]: MISStudentPayment })

			return merged_payments
		}

		return this.student().payments
	}

	student = (): MISStudent => {
		const id = this.studentID()
		return id === undefined ? this.siblings()[0] : this.props.students[id]
	}

	siblings = (): AugmentedSibling[] => {

		const { students, classes } = this.props

		const famId = this.familyID()

		return Object.values(students)
			.filter(s => s && s.Name && s.FamilyID && s.FamilyID === famId)
			.reduce((agg, curr) => {
				const section_id = curr.section_id
				return [
					...agg,
					{
						...curr,
						section: getSectionFromId(section_id, classes)
					}
				]
			}, [])
	}

	getFamily = (): AugmentedMISFamily => {
		const student = this.student()
		const family = {
			ID: student.FamilyID,
			ManName: student.ManName,
			ManCNIC: student.ManCNIC,
			Phone: student.Phone,
			children: this.siblings()
		}

		return family
	}

	generateVoucherNumber = (): number => Math.floor(100000 + Math.random() * 900000)

	render() {

		const { classes, settings, schoolLogo } = this.props
		const famId = this.familyID()

		let student_section: AugmentedSection
		let family: AugmentedMISFamily

		if (famId === undefined) {
			const section_id = this.student().section_id
			student_section = getSectionFromId(section_id, classes)
		} else {
			family = this.getFamily()
		}

		const filteredPayments = getFilteredPayments(this.mergedPaymentsForStudent(), "", "")

		// generate random voucher number
		const voucherNo = this.generateVoucherNumber()
		let vouchers = [];

		for (let i = 0; i < parseInt(settings.vouchersPerPage || "3"); i++) {

			if (famId === undefined) {
				vouchers.push(<StudentLedgerPage key={i}
					payments={filteredPayments}
					settings={settings}
					student={this.student()}
					section={student_section}
					voucherNo={voucherNo}
					css_style={i === 0 ? "" : "print-only"}
					logo={schoolLogo}
					month={this.month()}
					year={this.year()} />)
			} else {
				vouchers.push(<StudentLedgerPage key={i}
					payments={filteredPayments}
					settings={settings}
					family={family}
					voucherNo={voucherNo}
					css_style={i === 0 ? "" : "print-only"}
					logo={schoolLogo}
					month={this.month()}
					year={this.year()} />)
			}
		}
		const RenderBody = <div className="student-fees-ledger">
			<div className="print button" style={{ marginBottom: "10px" }} onClick={() => window.print()}>Print</div>
			<div className="voucher-row">{vouchers}</div>
		</div>

		if (famId === undefined) {
			return RenderBody
		}
		// if family payment ledger
		return <Layout history={this.props.history}>
			<div style={{ marginTop: 10 }}>{RenderBody}</div>
		</Layout>
	}

}
export default connect((state: RootReducerState) => ({
	classes: state.db.classes,
	faculty_id: state.auth.faculty_id,
	students: state.db.students,
	settings: state.db.settings,
	schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : ""
}))(withRouter(printPreview))
