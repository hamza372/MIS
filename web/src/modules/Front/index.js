import React, { Component } from 'react'
import Layout from "components/Layout"
import logo from './favicon.ico'
import play from './images/play.svg'
import setup from "./images/setup1.png"
import action from "./images/action.png"
import dail_stats from "./images/daily_stats2.png"
import home from "./images/home.png"

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

import './style.css'

export default class Front extends Component {
    constructor(props) {
      super(props)
    
      this.state = {
         iframe: false
      }
    }
    
  render() {
    return <Layout history={this.props.history}>
      <div className="mischool-resume">
        {/*Header*/}
        <div className="headers bg-red">
            <img src={logo} className="logo"/> 
        </div>

        {/**BODY */}
        <div className="body">
          
            <div className="card-video" onClick={()=> this.setState({ iframe: true })}>
                
              {!this.state.iframe ?
                <div className="cv-img-container" style={{ backgroundImage: `url(${play})`}}>
                    <img className="cv-image" src={home}/>
                </div>
                :
                <iframe src='https://youtube.com/embed/cm73XDWTiNQ'
                  height = "300px"
                  width ="100%"
                  frameBorder ='0'
                  allow ='autoplay; encrypted-media'
                  allowFullScreen
                  title='video'
                />
              }
            </div>

          {/** ==========================> CARD-1 <======================================== */}
          <div className="card">
            
            <div className="img-container">
                <img className="image" src={action} />
            </div>
            <div className="info" >
              <h2 className="card-title">What is MISchool?</h2>
              <p className="para">
                MISchool is a management information system for schools. MISchool enables school to collect,
                organize, and store records giving your school full control of all academic, 
                finance, wellbeing, and administrative information. It consists of almost everything that is 
                required by the school administration.
              </p>
            </div>
          </div>
          
          {/**======================> what are we offering? <============================== */}
          <h1 style={{
            display:"flex",
            flexDirection:"row",
            justifyContent:"center",
            color:"#fc6171",
            
          }}> What is MISchool Offering? </h1>


          {/** =========================================== */}

          {/** ==========================> CARD-1 <======================================== */}
          <div className="card">
            <div className="info" >
              <h2 className="card-title"> Actions </h2>
              <p className="para">
                Actions provides the user easy access to daily used modules such as,
              </p>

              <div className="icard-row">
                
                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={attendanceIcon}/>
                  </div>
      
                  <p className="icard-para">
                  Easy and fast student’s attendance module lets the user send daily attendance directly to parents.
                  </p>

                </div>

                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={teacherAttendanceIcon}/>
                  </div>
      
                  <p className="icard-para">
                  MISchool teacher attendance module keeps the record of teachers attendance and timings as well.                  </p>

                </div>
                
              </div>

              <div className="icard-row">
                
                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={feesIcon}/>
                  </div>
      
                  <p className="icard-para">
                  Fees record of all students, 
                  Payment information 
                  Printable voucher 
                  Fees receipt can be directly send to parents through sms.
                  Charges on all student or on one class can be added in one click.

                  </p>

                </div>

                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={marksIcon}/>
                  </div>
      
                  <p className="icard-para">
                  The exam module keeps a record of all the tests, exams,to be compiled in result card.
                  </p>

                </div>
                
              </div>

              <div className="icard-row">
                
                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={analyticsIcon}/>
                  </div>
      
                  <p className="icard-para">
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                  </p>

                </div>

                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={resultIcon}/>
                  </div>
      
                  <p className="icard-para">
                  The result card module prints or send sms result card of all students of a class in one click.
                  </p>

                </div>
                
              </div>

              <div className="icard-row">
                
                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={smsIcon}/>
                  </div>
      
                  <p className="icard-para">
                  SMS module is the most significant module especially made for schools convenience. It allows sending all kinds of SMS to parents, students and staff right to their mobile phones directly from the cloud system.
                  </p>

                </div>

                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={diary}/>
                  </div>
      
                  <p className="icard-para">
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                  </p>

                </div>
                
              </div>
              {/**============>_icard_<============== */}

            </div>
            <div className="img-container">
              <img className="image" src={action} />
            </div>
          </div>

          {/** =========================================== */}


          {/** ==========================> CARD-2 <======================================== */}
          <div className="card">
            <div className="img-container">
              <img className="image" src={setup} />
            </div>
            <div className="info" >

              <h2 className="card-title"> Setup </h2>
              <p className="para">
              It is the section through which school would setup the system according to their school,
              add/make/maintain record of the profiles of their teachers and students.
              </p>

              <div className="icard-row">
                
                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={teachersIcon}/>
                  </div>
      
                  <p className="icard-para">
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                  </p>

                </div>

                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={studentsIcon}/>
                  </div>
      
                  <p className="icard-para">
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                  </p>

                </div>
                
              </div>

              <div className="icard-row">
                
                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={classesIcon}/>
                  </div>
      
                  <p className="icard-para">
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                  </p>

                </div>

                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={settingsIcon}/>
                  </div>
      
                  <p className="icard-para">
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                  </p>

                </div>
                
              </div>

              <div className="icard-row">
                
                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={prospective}/>
                  </div>
      
                  <p className="icard-para">
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                  </p>

                </div>

                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={Help}/>
                  </div>
      
                  <p className="icard-para">
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                  </p>

                </div>
                
              </div>

              <div className="icard-row">
                
                <div className="icon-card">
                  
                  <div className="icard-image-container">
                    <img className="icard-image" src={switchUserIcon}/>
                  </div>
      
                  <p className="icard-para">
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                  </p>

                </div>
                
              </div>
              {/**============>_icard_<============== */}

            </div>
          </div>

          {/** =========================================== */}

          {/** ==========================> CARD-3 <======================================== */}
          <div className="card">
            <div className="info" >
              <h2 className="card-title">Daily Statistics</h2>
              <p className="para">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                when an unknown printer took a galley of type and scrambled it to make a type 
                specimen book. It has survived not only five centuries, but also the leap into 
                electronic typesetting, remaining essentially unchanged. It was popularised in 
                the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, 
                and more recently with desktop publishing software like Aldus PageMaker including 
                versions of Lorem Ipsum.
              </p>
              
            </div>
            <div className="img-container">
              <img className="image" src={dail_stats} style={{ width:"200px"}}/>
            </div>
          </div>

          {/** ===================> Packages <======================== */}

          <div className="package-container" >
              <h2 style={{ color: "#fc6171" }}>Packages</h2>
              <div className="pcard-container">
                <div className="pcard"> 
                  
                  <h4>Starter</h4>
                  <div>
                    <li>asdasjkajkl 100</li>
                  </div>

                </div>

                <div className="pcard">
                  
                  <h4>Standard</h4>
                  <div>
                    <li>asdasjkajkl 100</li>
                  </div>

                </div>

                <div className="pcard">
                  
                  <h4>Pro</h4>
                  <div>
                    <li>asdasjkajkl 100</li>
                  </div>

                </div>

              </div>
          </div>

          {/**======================> About Us <============================== */}
          <h1 style={{
            display:"flex",
            flexDirection:"row",
            justifyContent:"center",
            color:"#fc6171",
            
          }}> About Us </h1>

          {/** ==========================> CARD-4 <======================================== */}
          <div className="card">
            <div className="info" >
              <h2 className="card-title"> Who are we?</h2>
              <p className="para">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                when an unknown printer took a galley of type and scrambled it to make a type 
                specimen book. It has survived not only five centuries, but also the leap into 
                electronic typesetting, remaining essentially unchanged. It was popularised in 
                the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, 
                and more recently with desktop publishing software like Aldus PageMaker including 
                versions of Lorem Ipsum.
              </p>
              
            </div>
            {/* <div className="img-container">
              <img className="image" src={dail_stats} style={{ width:"200px"}}/>
            </div> */}
          </div>




        </div>
        
        {/**FOOTER */}
        <div className="footer bg-red">

          <div>
            <h2>Contact Us</h2>
            <li>Phone: +92 123 4567891</li>
            <li>Phone: +92 123 4567891</li>
            <li>Phone: +92 123 4567891</li>
          </div>

          
        </div>
      </div>
    

    </Layout>
  }
}
