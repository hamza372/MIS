import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Provider } from 'react-redux'

import Landing from 'modules/Landing'
import TeacherList from 'modules/Teacher/List'
import TeacherSingle from 'modules/Teacher/Single'
import StudentList from 'modules/Student/List'
import StudentSingle from 'modules/Student/Single'
import Login from 'modules/Login'
import SchoolLogin from 'modules/Login/school'
import ClassModule from 'modules/Class'
import ClassSingle from 'modules/Class/Single'
import Attendance from 'modules/Attendance'
import TeacherAttendance from 'modules/Teacher-Attendance'

import AuthedRoute from 'components/AuthedRoute'

export default ({ store }) => (
	<Provider store={store}>
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

				<Route path="/school-login" component={SchoolLogin} />
				<Route path="/login" component={Login} />
			</Switch>
		</BrowserRouter>
	</Provider>
)
