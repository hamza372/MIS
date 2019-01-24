import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Provider } from 'react-redux'

import ErrorComponent from 'components/Error'

import Landing from 'modules/Landing'
import TeacherList from 'modules/Teacher/List'
import TeacherSingle from 'modules/Teacher/Single'
import StudentList from 'modules/Student/List'
import StudentSingle from 'modules/Student/Single'
import Login from 'modules/Login'
import SchoolLogin from 'modules/Login/school'
import ClassModule from 'modules/Class/List'
import ClassSingle from 'modules/Class/Single'
import Attendance from 'modules/Attendance'
import TeacherAttendance from 'modules/Teacher-Attendance'
import SMS from 'modules/SMS'
import Marks from 'modules/Marks'
import ExamList from 'modules/Marks/ExamList'
import SingleExam from 'modules/Marks/SingleExam'
import Settings from 'modules/Settings'
import Analytics from 'modules/Analytics'
import ReportsMenu from 'modules/ReportsMenu'
import PromotionPage from 'modules/Settings/promote-students'

import AuthedRoute from 'components/AuthedRoute'

export default class Routes extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			error: false,
			err: false,
			errInfo: false
		}
	}

	componentDidCatch(err, errinfo) {
		console.error("component did catch: ", err)
		this.setState({
			error: true,
			err,
			errInfo: errinfo
		})
	}

	render() {

		if(this.state.error) {
			return <ErrorComponent err={this.state.err} errInfo={this.state.errInfo} />
		}

		return <Provider store={this.props.store}>
			<BrowserRouter>
				<Switch>
					<AuthedRoute exact path="/" component={Landing} />

					<Route path="/faculty/first" component={TeacherSingle} />
					<AuthedRoute path="/faculty/:id" component={TeacherSingle} />
					<AuthedRoute path="/teacher" component={TeacherList} />

					<AuthedRoute path="/student/:id" component={StudentSingle} />
					<AuthedRoute path="/student" component={StudentList} />

					<AuthedRoute path="/class/:id" component={ClassSingle} />
					<AuthedRoute path="/class" component={ClassModule} />

					<AuthedRoute path="/attendance" component={Attendance} />
					<AuthedRoute path="/teacher-attendance" component={TeacherAttendance} />

					<AuthedRoute path="/sms" component={SMS} />

					<AuthedRoute path="/reports/:class_id/:section_id/new" component={SingleExam} />
					<AuthedRoute path="/reports/:class_id/:section_id/exam/:exam_id" component={SingleExam} />
					<AuthedRoute path="/reports/:class_id/:section_id" component={ExamList} />
					<AuthedRoute path="/reports" component={Marks} />

					<AuthedRoute path="/settings/promote" component={PromotionPage} />
					<AuthedRoute path="/settings" component={Settings} />
					<AuthedRoute path="/analytics" component={Analytics} />

					<AuthedRoute path="/reports-menu" component={ReportsMenu} />

					<Route path="/school-login" component={SchoolLogin} />
					<Route path="/login" component={Login} />
				</Switch>
			</BrowserRouter>
		</Provider>
	}
}
