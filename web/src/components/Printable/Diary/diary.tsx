import React from 'react'
import DiaryCard from './diarycard';

type PropsType = {
    schoolName: string
    sectionName: string
    schoolDiary: Diary
    diaryDate: string
}

interface Diary {
    [id: string]: string
}

const DiaryPrintable = (props: PropsType) => {

    return(<div className="print-only" style={{width: "95%", marginTop: 10}}>
            <DiaryCard {...props} />
            <DiaryCard {...props} />
            <DiaryCard {...props} />
            <DiaryCard {...props} />
        </div>);
}

export default DiaryPrintable