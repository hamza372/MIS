import * as React from 'react'
import StudentAttendance from '../../components/StudentAttendance'
import TeacherAttendance from '../../components/TeacherAttendance';
import Fees from '../../components/Fees';
import Exams from '../../components/Exams';


export default () => <div className="page">
	Dashboard
	
	<StudentAttendance />
	<TeacherAttendance/>
	<Fees/>
	<Exams/>
</div>