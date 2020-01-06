import React, { Component } from 'react'
import Layout from 'components/Layout'
import { connect } from 'react-redux'
import moment from 'moment'
import { RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'
import getStudentSection from 'utils/getStudentSection'
import queryString from 'querystring'

import './style.css'

interface P {
    classes: RootDBState["classes"]
    students: RootDBState["students"]
}

type PropsType = P & RouteComponentProps

type S = {
    statsType: string
}

type AugmentedStudent = MISStudent & { amount_paid: number, section: AugmentedSection }

class DailyStats extends Component<PropsType, S> {
    constructor(props: PropsType) {
        super(props)
        
        const parsed_query = queryString.parse(this.props.location.search)

		const type = parsed_query["?type"] ? parsed_query["?type"].toString() : ''
        
        this.state = {
            statsType: type
        }
    }

    getFeeStats = () => {

        const { classes, students } = this.props

        const today_date = moment().format("YYYY-MM-DD")
        const chunk_size = 32

        let total_amount_received = 0
        let total_students_paid = 0
        let paid_students = [] as AugmentedStudent[]

		for(const student of Object.values(students)) {

			if(student && student.Name) {
		
				const additional_payment = Object.values(student.payments || {})
					.filter(x => moment(x.date).format("YYYY-MM-DD") === today_date && x.type === "SUBMITTED")
					.reduce((agg, curr) => agg + curr.amount, 0);

				if(additional_payment > 0) {
                    paid_students.push({
                        ...student,
                        amount_paid: additional_payment,
                        section: getStudentSection(student.section_id, classes)
                    })
					total_students_paid += 1
				}

				total_amount_received += additional_payment;
			}
        }
        
        return(
            <>
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
                    <div className="list">
                        {
                            paid_students
                                .sort((a, b) => a.section.classYear - b.section.classYear)
                                .map(student => <div className="table row">
                                    <Link key={student.id} to={`/student/${student.id}/profile`}>
                                        {student.Name}
                                    </Link>
                                    <div>{student.section.namespaced_name}</div>
                                    <div>{student.amount_paid}</div>
                                </div>)
                        }
                    </div>
                    <div className="row print-button">
                        <div className="button grey" onClick={() => window.print()}>Print Paid Students List</div>
                    </div>
                </div>

            </>);
    }

    renderSection = () => {

        const type = this.state.statsType

        if(type === 'paid_students') {
            return this.getFeeStats()
        }
    }

    render() {

        return(
            <Layout history={this.props.history}>
                <div className="daily-stats">
                    <div className="title no-print">Daily Statistics</div>
                    {
                        this.renderSection()
                    }
                </div>
            </Layout>
        );
    }
}

export default connect((state: RootReducerState) => ({
	students: state.db.students,
	classes: state.db.classes
}))(DailyStats);