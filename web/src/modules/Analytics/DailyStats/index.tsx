import React, { Component } from 'react'
import Layout from 'components/Layout'
import { connect } from 'react-redux'
import moment from 'moment'
import { RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'
import getSectionFromId from 'utils/getSectionFromId'
import queryString from 'query-string'
import { PaidFeeStudentsPrintableList } from 'components/Printable/Fee/paidList'
import chunkify from 'utils/chunkify'
import Former from 'utils/former'

import './style.css'

interface P {
    classes: RootDBState["classes"]
    students: RootDBState["students"]
}

type PropsType = P & RouteComponentProps

type S = {
    statsType: string
    statsDate: number
}

type AugmentedStudent = MISStudent & { amount_paid: number, balance: number, section: AugmentedSection }

class DailyStats extends Component<PropsType, S> {

    former: Former
    constructor(props: PropsType) {
        super(props)
        
        const parsed_query = queryString.parse(this.props.location.search)

		const type = parsed_query.type ? parsed_query.type.toString() : ''
        
        this.state = {
            statsType: type,
            statsDate: moment.now()
        }

        this.former = new Former(this, [])
    }

    getSiblings = (student: MISStudent): MISStudent[] => {
		const famId = student.FamilyID ? student.FamilyID : undefined 
        
        return Object.values(this.props.students)
			.filter(s => s && s.Name && s.FamilyID && s.FamilyID === famId)
	}

    mergedPayments = (student: MISStudent) => {

		const siblings = this.getSiblings(student)
		if(siblings.length > 0) {

			const merged_payments = siblings.reduce((agg, curr) => ({
				...agg,
				...Object.entries(curr.payments).reduce((agg, [pid, p]) => { 
					return {
						...agg,
						[pid]: {
							...p,
							fee_name: p.fee_name && `${curr.Name}-${p.fee_name}`,
							student_id: curr.id
						}
					}
				}, {})
			}), {} as AugmentedMISPaymentMap)

			return merged_payments;
		}

		return Object.entries(student.payments)
			.reduce((agg, [pid, curr]) => ({
				...agg,
				[pid]: {
					...curr,
					student_id: student.id,
				}
			}), {} as AugmentedMISPaymentMap)
	}

    getStudentBalance = (student: MISStudent) => {

        const balance = Object.values(this.mergedPayments(student))
            .reduce((agg, curr) => agg - (curr.type === "SUBMITTED" || curr.type === "FORGIVEN" ? 1 : -1) * curr.amount, 0)
        
        return balance
    }

    getFeeStats = () => {

        const { classes, students } = this.props
        const { statsDate } = this.state

        const today_date = moment(statsDate).format("YYYY-MM-DD")
        const chunk_size = 22

        let total_amount_received = 0
        let total_students_paid = 0
        let paid_students = [] as AugmentedStudent[]

		for(const student of Object.values(students)) {

			if(student && student.Name) {
		
				const amount_paid_today = Object.values(student.payments || {})
					.filter(payment => moment(payment.date).format("YYYY-MM-DD") === today_date && payment.type === "SUBMITTED")
					.reduce((agg, curr) => agg + curr.amount, 0);

				if(amount_paid_today > 0) {
                    paid_students.push({
                        ...student,
                        amount_paid: amount_paid_today,
                        balance: this.getStudentBalance(student),
                        section: getSectionFromId(student.section_id, classes)
                    })
					total_students_paid += 1
				}
				total_amount_received += amount_paid_today
			}
        }
        
        return(<>
                <div className="section no-print">
                    <div className="title">Students Fee</div>
                    <div className="table row">
                        <label>Total Amount Received: </label>
                        <div className="number">Rs. { total_amount_received }</div>
                    </div>
                    <div className="table row student-count">
                        <label>Total Students Paid: </label>
                        <div className="number">{ total_students_paid }</div>
                    </div>
                    <div style={{ border: "1px solid grey", borderRadius: '4px', padding: '5px' }}>
                        <div className="table row">
                            <label><b>Name</b></label>
                            <label><b>Class</b></label>
                            <label><b>Amount Paid</b></label>
                            <label><b>Balance</b></label>
                        </div>
                        {
                            paid_students
                                .sort((a, b) => ((a.section && a.section.classYear) || 0) - ((b.section && b.section.classYear) || 0))
                                .map(student => <div className="table row" key={student.id}>
                                    {
                                        student.FamilyID && student.FamilyID !== "" ? <Link to={`/families/${student.FamilyID}`}>{student.FamilyID}(F)</Link> : 
                                            <Link to={`/student/${student.id}/payment`}>{student.Name}</Link>
                                    }
                                    <div>{(student.section && student.section.namespaced_name) || ''}</div>
                                    <div>{student.amount_paid}</div>
                                    <div className={student.balance > 0 ? 'pending-amount' : "advance-amount"}>{student.balance}</div>
                                </div>)
                        }
                    </div>
                    <div className="row print-button">
                        <div className="button grey" onClick={() => window.print()}>Print Paid Students List</div>
                    </div>
                </div>
                {
                    chunkify(paid_students, chunk_size)
                        .map((itemsChunk: AugmentedStudent[], index: number) => <PaidFeeStudentsPrintableList key={ index } 
                            students={ itemsChunk }
                            chunkSize={ index === 0 ? 0 : chunk_size * index }
                            totalAmount={ total_amount_received }
                            totalStudents={ total_students_paid }
                            paidDate={ moment(statsDate).format("DD/MM/YYYY") }
                            />)
                }
            </>);
    }

    renderSection = () => {

        const type = this.state.statsType

        if(type === 'paid_students') {
            return this.getFeeStats()
        }
    }

    render() {

        const { statsDate } = this.state

        return(<Layout history={this.props.history}>
                <div className="daily-stats">
                    <div className="title no-print">Daily Statistics</div>
                    <div className="row date no-print">
                        <input type="date" 
                            onChange={this.former.handle(["statsDate"])} 
                            value={moment(statsDate).format("YYYY-MM-DD")} 
                            placeholder="Current Date" />
                    </div>
                    {
                        this.renderSection()
                    }
                </div>
            </Layout>);
    }
}

export default connect((state: RootReducerState) => ({
	students: state.db.students,
	classes: state.db.classes
}))(DailyStats);