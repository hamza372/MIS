import React from 'react'

import './style.css'

type PropsType = {
    schoolName: string
    sectionName: string
    schoolDiary: Diary
    diaryDate: string
}

interface Diary {
    [id: string]: string
}


const DiaryCard = (props: PropsType) => {

    return(<div className="printable-diary">
            <fieldset>
                <legend>{props.schoolName} | {props.sectionName} Diary - {props.diaryDate}</legend>
                <div className="print-table">
                    <table>
                        <thead>
                            <tr>
                                <th style={{width: "20%"}}>Subjects</th>
                                <th style={{width: "80%"}}>Home Work</th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            Object.entries(props.schoolDiary)
                                .map(([subject, homework]) =><tr key={subject}>
                                    <td>{subject}</td>
                                    <td>{homework}</td>
                                </tr>)
                        }
                        </tbody>
                    </table>
                </div>
            </fieldset>
        </div>);

}

export default DiaryCard