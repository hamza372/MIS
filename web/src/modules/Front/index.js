import React, { Component } from 'react'

import Layout from "components/Layout"
import logo from './favicon.ico'
import cerpLogo from './images/cerp-logo1.png'
import setup from "./images/setup1.png"
import cloudIcon from "./images/cloud.svg"
import mdsupportIcon from "./images/mdsupport.svg"
import syncIcon from "./images/sync.svg"
import coinsIcon from "./images/coins.svg"
import supportIcon from "./images/support.svg"
import action from "./images/action.png"
import dail_stats from "./images/daily-stats.png"
import attendanceIcon from '../Landing/icons/attendance/checklist_1.svg'
import teacherAttendanceIcon from '../Landing/icons/attendance/Attendance.svg'
import feesIcon from '../Landing/icons/fees/accounting.svg'
import marksIcon from '../Landing/icons/Marks/exam.svg'
import analyticsIcon from '../Landing/icons/Analytics/increasing-stocks-graphic-of-bars.svg'
import resultIcon from '../Landing/icons/result_card/exam-a-plus.svg'
import smsIcon from '../Landing/icons/SMS/sms_1.svg'
import Help from '../Landing/icons/Help/help.svg'
import diary from '../Landing/icons/Diary/diary.svg'
import teachersIcon from '../Landing/icons/Teacher/teacher_1.svg'
import studentsIcon from '../Landing/icons/Student/student_profile_1.svg'
import classesIcon from '../Landing/icons/Classes/classes_1.svg'
import settingsIcon from '../Landing/icons/Settings/settings-gears.svg'
import switchUserIcon from '../Landing/icons/switch_user/logout.svg'
import prospective from '../Landing/icons/Prospective/prospective.svg'

import SignUp from './SignUp'

import './style.css'

class Front extends Component {

  constructor(props) {
    super(props)
  
    this.state = {
       signUp: false,
       packageName: ""
    }
  }

  setPackage = (packageName) =>{
    this.setState({
      signUp: !this.state.signUp,
      packageName
    })
  }
  
    
  render() {
    return <Layout history={this.props.history}>
      <div className="mischool-resume">
        {/*Header*/}
        <div className="headers bg-red">
            <div className="logo-container" to="/">
              <img src={logo} className="logo"/>
            </div>
        </div>


        {/**BODY */}
                
        <div className="body">

          <div className="logo-container-cerp" style={{ backgroundColor:"#fafafa"}}>
            <img src={cerpLogo} className="logo-cerp"/>
          </div>
          <div className="card video">
            <iframe src='https://youtube.com/embed/cm73XDWTiNQ'
              height = "290px"
              width ="100%"
              frameBorder ='0'
              allowFullScreen
              title='video'
            />
          </div>
          
          <div className="card">
            <div className="info" style={{width:"100%", alignItems:"center"}}>
              <div className="card-title intro">What is MISchool?</div>
              <div className="para">
                MISchool is a management information system for schools. MISchool enables school to collect,
                organize, and store records giving your school full control of all academic, 
                finance, wellbeing, and administrative information. It consists of almost everything that is 
                required by the school administration.
              </div>
            </div>
          </div>

          <div className="card">
            <div className="info" >
              <div className="card-title"> Actions </div>
              <div className="para">
                Actions provides the user easy access to daily used modules such as,
              </div>

              <div className="icard-row">
                
                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={attendanceIcon}/>
                    <div className="image-title">Attendance</div>
                  </div>
      
                  <div className="icard-para">
                  Instant and easy access, One click process
                  </div>

                </div>

                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={teacherAttendanceIcon}/>
                    <div className="image-title">Teacher Attendance</div>

                  </div>
      
                  <div className="icard-para">
                    MISchool teacher attendance module keeps the record of teachers attendance and timings as well.                  </div>

                </div>
                
              </div>

              <div className="icard-row">
                
                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={feesIcon}/>
                    <div className="image-title">Fees</div>

                  </div>
      
                  <div className="icard-para">
                    Computerized vouchers
                    Automatic calculations 
                    Safe record keeping
                  </div>

                </div>

                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={marksIcon}/>
                    <div className="image-title">Marks</div>

                  </div>
      
                  <div className="icard-para">
                  Automatic grade calculations.
                  Print result card of all your students in one click
                  </div>

                </div>
                
              </div>

              <div className="icard-row">
                
                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={analyticsIcon}/>
                    <div className="image-title">Analytics</div>

                  </div>
      
                  <div className="icard-para">
                  Graphical representation of your data
                  Informed decision by comparing old and new data                  
                  </div>

                </div>

                <div className="icon-card">

                  <div className="icard-image-container">
                    <img className="icard-image" src={resultIcon}/>
                    <div>Result</div>
                  </div>

                  <div className="icard-para">
                    The result card module prints or send sms result card of all students of a class in one click.
                  </div>

                </div>
              </div>

              <div className="icard-row">
                
                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={smsIcon}/>
                    <div className="image-title">SMS</div>
                  </div>
      
                  <div className="icard-para">
                  Connects you with parents, faculty and staff efficiently 
                  </div>

                </div>

                <div className="icon-card">

                  <div className="icard-image-container">
                    <img className="icard-image" src={diary}/>
                    <div className="image-title">Diary</div>
                  </div>

                  <div className="icard-para">
                  A bonus module connecting faculty, students and parents
                  </div>

                </div>
              </div>

            </div>
            <div className="img-container">
              <img className="image" src={action}/>
            </div>
          </div>

          <div className="card setup">
            <div className="img-container">
              <img className="image" src={setup}/>
            </div>
            <div className="info" >

              <div className="card-title"> Setup </div>
              <div className="para">
              It is the section through which school would setup the system according to their school,
              add/make/maintain record of the profiles of their teachers and students.
              </div>

              <div className="icard-row">
                
                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={teachersIcon}/>
                    <div className="image-title">Teacher Setup</div>
                  </div>
      
                  <div className="icard-para">
                  Teacher’s profile module facilitates schools to keep a detailed record of all teachers. 
                  </div>

                </div>

                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={studentsIcon}/>
                    <div className="image-title">Student Setup</div>
                  </div>
      
                  <div className="icard-para">
                  Student’s profile module saves all required information of students. 
                  </div>

                </div>
                
              </div>

              <div className="icard-row">
                
                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={classesIcon}/>
                    <div className="image-title">Classes</div>
                  </div>
      
                  <div className="icard-para">
                  Schools can add classes or sections according to their system.
                  </div>

                </div>

                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={settingsIcon}/>
                    <div className="image-title">Settings</div>
                  </div>
      
                  <div className="icard-para">
                  Settings let the user setup basic things in MISchool such as teacher’s permission,
                  logo, school information for header in printing etc.
                  </div>

                </div>
                
              </div>

              <div className="icard-row">
                
                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={prospective}/>
                    <div className="image-title">Prospective Student</div>
                  </div>
      
                  <div className="icard-para">
                  Prospective students is especially made for schools marketing so through this
                  schools can send a message to
                  the parents that inquired about fees/school but didn’t come back for admission.                  </div>

                </div>

                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={Help}/>
                    <div className="image-title">Help</div>
                  </div>
      
                  <div className="icard-para">
                  Help button connects the user instantly to our customer service.
                  </div>

                </div>
                
              </div>

              <div className="icard-row">
                
                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={switchUserIcon}/>
                    <div className="image-title">Logout</div>
                  </div>
      
                  <div className="icard-para">
                  Switch users with just a click
                  </div>

                </div>
                
              </div>
            </div>
          </div>

          <div className="card">
            <div className="info" >
              <div className="card-title">Daily Statistics</div>
              <div className="para">
              Daily statistics lets the owner get daily updates about no. 
              of students present, no. of teachers present, status of fee 
              collection
              </div>
              
            </div>
            <div className="img-container">
              <img className="image" src={dail_stats}/>
            </div>
          </div>

          <div className="card-heading"> What makes us Different? </div>

          <div className="card diff">

            <div className="info" >
                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={syncIcon}/>
                    <div className="image-title"> Auto-Synchronization </div>
                  </div>
                  <div className="icard-para">
                  Sync your MIS features to all your devices so that you can always access 
                  your important data
                  </div>

                </div>

                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={mdsupportIcon}/>
                    <div className="image-title"> Multiple Device Support </div>
                  </div>
                  <div className="icard-para">
                  Various platforms support MIS application with its features 
                  adapting to the screen you are viewing through.
                  </div>

                </div>
                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={cloudIcon}/>
                    <div className="image-title"> Cloud-Backup </div>
                  </div>
                  <div className="icard-para">
                  Cloud backup system keeps your information safe on cloud for years and years. 
                  </div>

                </div>
                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={supportIcon}/>
                    <div className="image-title"> Excellent Customer Service </div>
                  </div>
                  <div className="icard-para">
                  Our team is equipped to handle software issues in an efficient friendly
                  manner to your satisfaction.
                  </div>

                </div>
                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={coinsIcon}/>
                    <div className="image-title"> Best Price </div>
                  </div>
                  <div className="icard-para">
                  You can use the MIS application with just a one time payment and
                   we assure you that there are no hidden fees such has monthly and annual charges.                  </div>

                </div>
                
              </div>
                
          </div>

          <div className="package-container" >
              <div className="card-heading">Packages</div>
              <div className="pcard-container slider">
                <div className="pcard slide"> 
                  
                  <div className="bg-blue pcard-title" >Taleem-1</div>
                  <div className="para" >
                    <li>150 Students </li>
                    <li>Price: <strong>7,500 Pkr</strong></li>
                  </div>
                </div>

                <div className="pcard slide">
                  
                  <div className="bg-green pcard-title" >Taleem-2</div>
                  <div className="para">
                    <li>300 Students</li>
                    <li>Price: <strong>10,500 Pkr</strong></li>
                  </div>
                </div>

                <div className="pcard slide">
                  
                  <div className="bg-red pcard-title" >Taleem-3</div>
                  <div className="para">
                    <li>Unlimited Students</li>
                    <li>Price: <strong>14,500 Pkr</strong></li>
                  </div>
                </div>

                <div className="pcard slide">
                  
                  <div className="bg-purple pcard-title">Special offer </div>
                  <div className="para">
                    <li>Free 15 days Trial</li>
                    <li>Free data entry</li>
                    <li>Free staff training</li>
                  </div>

                </div> 

              </div>
          </div>

          <div className="card-heading"> Sign Up</div>

          <SignUp/>

          <div className="card-heading"> About Us </div>

          <div className="card" style={{ justifyContent:"center"}}>
            <div className="info" >
              <div className="card-title"> Who are we?</div>
              <div className="para">
              MISchool is developed by the <a href="https://cerp.org.pk">Centre for Economic Research in Pakistan (CERP)</a>. 
              CERP, is a leading independent nonpartisan policy institution that, 
              amongst other areas, has been working towards the betterment of private schools 
              since the last 15 years.
              </div>
            </div>

            <div className="img-container">
              <img className="image-cerp" src={cerpLogo}/>
            </div>
          </div>




        </div>
        
        {/**FOOTER */}
        <div className="footer bg-red">

          <div className="contact-us">
            <div className="title">Contact Us</div>
            <a href="tel:+923481112004">+92 348 111 2004</a>
            <a href="mailto:mischool@cer.org.pk" >mischool@cerp.org.pk</a>
            <a href="https://maps.app.goo.gl/iR1Zx">19-A FCC Syed Maratib Ali Road, Lahore</a>
          </div>

          
        </div>
      </div>
    

    </Layout>
  }
}
export default Front
