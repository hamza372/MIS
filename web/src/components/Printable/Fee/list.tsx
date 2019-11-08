import React from "react"
import "./../print.css"

type PropsTypes = {
    items: any
    chunkSize: number
    schoolName: string
    sections: SectionItem[]
}

type SectionItem = {
    id: string;
    class_id: string;
    namespaced_name: string;
    className: string;
    classYear: number;
    name: string;
    faculty_id?: string;
}
interface Payment {
	SUBMITTED: number
	SCHOLARSHIP: number
	OWED: number
	FORGIVEN: number
}

type itemsType = {
    student: MISStudent
	debt: Payment
	familyId?: string
}


export const OutstandingFeePrintableList = (props: PropsTypes) => {


    const calculateDebt = ({ SUBMITTED, FORGIVEN, OWED, SCHOLARSHIP }: Payment) => (SUBMITTED + FORGIVEN + SCHOLARSHIP - OWED) * -1;

    const getStudentSection = (id: string): string => {
        const section =  props.sections.filter(section => section.id === id)[0]
        return section !==undefined ? section.namespaced_name : "-"
    } 

    return (
        <div className="print-only print-table">
            <table>
                <caption>
                    <div>{ props.schoolName ? props.schoolName.toUpperCase() : "" }</div>
                    <div>Outstaning Fee Students List</div>
                </caption>
                <thead>
                    <tr>
                        <th className="row-sr">Sr #</th>
                        <th className="row-name">Name</th>
                        <th className="row-class">Class</th>
                        <th className="row-roll">Roll #</th>
                        <th className="row-phone">Phone #</th>
                        <th className="row-amount">Amount</th>
                    </tr>
                </thead>
                <tbody>
                   {
                    props.items.map(({ student, debt, familyId }:itemsType, i: number) => <tr key={student.id}>
                        <td style={{textAlign: "center"}}>{i + props.chunkSize + 1}</td>
                        <td>{student.Name}</td>
                        <td>{getStudentSection(student.section_id)}</td>
                        <td style={{textAlign: "center"}}>{student.RollNumber}</td>
                        <td style={{textAlign: "center"}}>{student.Phone}</td>
                        <td>{calculateDebt(debt)}</td>     
                    </tr>) 
                   }
                </tbody>
            </table>
        </div>
    )
}