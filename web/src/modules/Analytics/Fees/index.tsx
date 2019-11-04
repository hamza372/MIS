import React, {Component} from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import { connect } from 'react-redux'
import moment from 'moment'
import queryString from 'querystring'
import { addMultiplePayments } from 'actions'
import { PrintHeader } from 'components/Layout'
import Former from 'utils/former'
import checkDuesAsync from 'utils/calculateDuesAsync'
import { numberWithCommas } from 'utils/numberWithCommas'
import { getSectionsFromClasses } from 'utils/getSectionsFromClasses'

import { ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts'

interface Filters {
	total: boolean;
	paid: boolean;
	forgiven: boolean;
	pending: boolean;
}

interface Payment {
	SUBMITTED: number;
	SCHOLARSHIP: number;
	OWED: number;
	FORGIVEN: number;
}

interface ChartProps {
	payments: {
		[is: string]: Payment;
	};
	filter: Filters;
	date_format: string;
}

const FeesChart = (props: ChartProps) => {
	const filter = props.filter
	return <ResponsiveContainer width="100%" height={200}>
				<LineChart 
					data={
						Object.entries(props.payments)
							.sort(([d1,], [d2,]) => moment(d1, props.date_format).diff(moment(d2, props.date_format)))
							.map(([month, { OWED, SUBMITTED, FORGIVEN }]) => ({
								month, OWED, SUBMITTED, FORGIVEN, net: Math.abs(SUBMITTED - OWED) 
							}))}>
					
					<XAxis dataKey="month" />
					<YAxis />
					<Tooltip />
					
					{ filter.total && <Line dataKey='OWED' name="Total" stroke="#74aced" strokeWidth={3} /> }
					{ filter.paid && <Line dataKey="SUBMITTED" stroke="#93d0c5" name="Paid" strokeWidth={3}/> }
					{ filter.forgiven && <Line dataKey="FORGIVEN" stroke="#939292" name="Forgiven" strokeWidth={3}/>}
					{ filter.pending  && <Line dataKey='net' name="Pending" strokeWidth={3} stroke="#ff6b68" />}

				</LineChart>
			</ResponsiveContainer> 
}

interface TableProps {
	payments: {
		[id: string]: Payment;
	};
	total_debts: {
		PAID: number;
		SCHOLARSHIP: number;
		OWED: number;
		FORGIVEN: number;
	};
	date_format: string;
}

const FeesTable = (props: TableProps) => {
	
	const total = props.total_debts;
	const payments = props.payments;

	return <div className="section no-print table" style={{margin: "20px 0", backgroundColor:"#c2bbbb21", overflowX: "scroll" }}>
			<div className="table row heading">
				<label style={{ backgroundColor: "#efecec", textAlign:"center" }}> <b> Date     </b></label>
				<label style={{ backgroundColor: "#bedcff", textAlign:"center" }}> <b> Total    </b> </label>
				<label style={{ backgroundColor: "#93d0c5", textAlign:"center" }}> <b> Paid     </b> </label>
				<label style={{ backgroundColor: "#e0e0e0", textAlign:"center" }}> <b> Forgiven </b> </label>
				<label style={{ backgroundColor: "#fc6171", textAlign:"center" }}> <b> Pending  </b> </label>
			</div>
			{
				[...Object.entries(payments)
					.sort(([d1, ], [d2, ]) => moment(d1, props.date_format).diff(moment(d2, props.date_format)))
					.map(([month, { OWED, SUBMITTED, FORGIVEN, SCHOLARSHIP }]) => {

						const red = "#fc6171"
						return <div className="table row" key={month}>
							<div style={{ backgroundColor: "#efecec", textAlign:"center" }}>{month}</div>
							<div style={{ backgroundColor: "#bedcff", textAlign:"center" }}>{numberWithCommas(OWED)}</div>
							<div style={{ backgroundColor: "#93d0c5", textAlign:"center" }}>{numberWithCommas(SUBMITTED)}</div>
							<div style={{ backgroundColor: "#e0e0e0", textAlign:"center" }}>{numberWithCommas(FORGIVEN + SCHOLARSHIP)}</div>
							<div style={{ backgroundColor: red, textAlign:"center" }}>{numberWithCommas(OWED - (SUBMITTED + FORGIVEN + SCHOLARSHIP))}</div>
						</div>
					}),
					<div className="table row footing" style={{borderTop: '1.5px solid #333'}} key={Math.random()}>
					<br/> 
						<label style={{ backgroundColor: "#efecec", textAlign:"center" }}><b>Total</b></label>
						<label style={{ backgroundColor: "#bedcff", textAlign:"center" }}><b>{numberWithCommas(total.OWED)}</b></label>
						<label style={{ backgroundColor: "#93d0c5", textAlign:"center" }}><b>{numberWithCommas(total.PAID)}</b></label>
						<label style={{ backgroundColor: "#e0e0e0", textAlign:"center" }}><b>{numberWithCommas(total.FORGIVEN + total.SCHOLARSHIP)}</b></label>
						<label style={{ backgroundColor: "#fc6171", textAlign:"center"}}><b>{numberWithCommas(Math.abs(total.OWED - (total.PAID + total.FORGIVEN)))}</b></label>
					</div>
				]
			}
		</div> 
			
}

type PaymentAddItem = {
	student: MISStudent;
	payment_id: string;
} & MISStudentPayment

interface P {
	students: RootDBState["students"];
	classes: RootDBState["classes"];
	settings: RootDBState["settings"];
	schoolLogo: RootDBState["assets"]["schoolLogo"];
	addPayments: (payments: PaymentAddItem[]) => void;
}

interface S {
	filterText: string;
	chartFilter: Filters;
	classFilter: string;
	is_fee_filter: boolean;
	selected_period: string;
	start_date: number;
	end_date: number;

	loading: boolean;
	payments: ChartProps["payments"];
	total_student_debts: StudentDebtMap;
	total_debts: {
		PAID: number;
		OWED: number;
		FORGIVEN: number;
		SCHOLARSHIP: number;
	};

}

interface routeInfo {

}

type StudentDebtMap = {
	[id: string]: {
		student: MISStudent;
		debt: Payment;
		familyId?: string;
	}; 
}

type PaymentSingleMap = {
	[id: string]: Payment;
}

type propTypes = RouteComponentProps<routeInfo> & P

class FeeAnalytics extends Component<propTypes, S> {

	former: Former
	background_calculation: NodeJS.Timeout

	constructor(props: propTypes) {
	  	super(props)
	
	 	 const parsed_query = queryString.parse(this.props.location.search);

		const sd_param = parsed_query["?start_date"] || ""
		const ed_param = parsed_query["end_date"] || ""
		const period = parsed_query["period"] || ""

		const start_date =  sd_param !== "" ? moment(sd_param, "MM-DD-YYYY").unix() * 1000 : moment().subtract(1,'year').unix() * 1000
		const end_date = ed_param !=="" ? moment(ed_param, "MM-DD-YYYY").unix() * 1000 : moment().unix() * 1000

		this.state = {
			filterText: "",
			chartFilter: {
				paid: true,
				forgiven: true,
				pending: true,
				total: true
			},
			classFilter: "",
			is_fee_filter: false,
			selected_period: period !== "" ? period.toString() : "Monthly",
			start_date,
			end_date,

			loading: true,
			payments: {},
			total_student_debts: {},
			total_debts: {
				PAID: 0,
				OWED: 0,
				FORGIVEN: 0,
				SCHOLARSHIP: 0
			}
		}

		this.former = new Former(this, [])
	}


	calculateDebt = ({ SUBMITTED, FORGIVEN, OWED, SCHOLARSHIP }: Payment) => SUBMITTED + FORGIVEN + SCHOLARSHIP - OWED;

	componentDidMount() {
		// first update fees
		const { students, addPayments } = this.props

		const s1 = new Date().getTime()
		console.log('computing dues')
		checkDuesAsync(Object.values(students))
			.then(nextPayments => {
				console.log('done computing dues', (new Date().getTime()) - s1)
				if(nextPayments.length > 0) {
					addPayments(nextPayments)
				}
			})

		this.calculate()
		
	}

	onStateChange = () => {

		const start_date = moment(this.state.start_date).format("MM-DD-YYYY")
		const end_date = moment(this.state.end_date).format("MM-DD-YYYY")
		const period = this.state.selected_period

		const url = '/analytics/fees'
		const params = `start_date=${start_date}&end_date=${end_date}&period=${period}`

		window.history.replaceState(this.state, "Fee Analytics", `${url}?${params}`)
		this.calculate()
	}

	componentWillReceiveProps(nextProps: propTypes) {

		const parsed_query = queryString.parse(nextProps.location.search);

		const sd_param = parsed_query["?start_date"] || ""
		const ed_param = parsed_query["end_date"] || ""
		const period = parsed_query["period"] || ""

		// set defaults if params are not passed
		const start_date =  sd_param !== "" ? moment(sd_param, "MM-DD-YYYY").unix() * 1000 : moment().subtract(1,'year').unix() * 1000
		const end_date = ed_param !=="" ? moment(ed_param, "MM-DD-YYYY").unix() * 1000 : moment().unix() * 1000
		const selected_period = period !=="" ? period.toString() : ""
		
		this.setState({
			start_date,
			end_date,
			selected_period
		})

		const { students, addPayments } = nextProps
		checkDuesAsync(Object.values(students))
			.then(nextPayments => {
				if(nextPayments.length > 0) {
					addPayments(nextPayments)
				}
			})
		
		this.calculate()

	}

	calculate = () => {

		const s1 = new Date().getTime();
		console.log("calculating...")

		let i = 0;

		clearTimeout(this.background_calculation)
		this.setState({
			loading: true
		})

		let total_paid = 0;
		let total_owed = 0;
		let total_forgiven = 0;
		let total_scholarship = 0;
		const payments = {} as ChartProps["payments"];
		const total_student_debts = {} as StudentDebtMap;
		let total_debts = { PAID: total_paid, OWED: total_owed, FORGIVEN: total_forgiven, SCHOLARSHIP: total_scholarship }; //Need a default otherwise throws an error when logged in for the first time
		
		const temp_sd = moment(this.state.start_date)
		const temp_ed = moment(this.state.end_date)
		const period_format = this.state.selected_period === "Daily" ? "DD/MM/YYYY" : "MM/YYYY"

		const { students } = this.props

		const student_list = Object.values(students)

		const reducify = () => {

			// in loop
			if(i >= student_list.length) {
				// we're done
				const s2 = new Date().getTime()
				console.log("DONE CALCULATING", s2 - s1)
				return this.setState({
					loading: false,
					payments,
					total_student_debts,
					total_debts
				})
			}

			const student = student_list[i];
			const sid = student.id;

			i += 1;
			console.log('processing student', i)

			const debt = { OWED: 0, SUBMITTED: 0, FORGIVEN: 0, SCHOLARSHIP: 0}
			
			for(const pid in student.payments || {}) {
				const payment = student.payments[pid];

				if(!( moment(payment.date).isSameOrAfter(temp_sd) && moment(payment.date).isSameOrBefore(temp_ed) )){
					continue
				}

				// some payment.amount has type string
				// @ts-ignore 
				const amount =  typeof(payment.amount) === "string" ? parseFloat(payment.amount) : payment.amount
				
				const period_key = moment(payment.date).format(period_format);
				const period_debt = payments[period_key] || { OWED: 0, SUBMITTED: 0, FORGIVEN: 0, SCHOLARSHIP: 0}
				
				// for 'scholarship', payment has also type OWED and negative amount
				if(amount < 0) {
					const new_amount = Math.abs(amount)
					debt["SCHOLARSHIP"] += new_amount
					period_debt["SCHOLARSHIP"] += new_amount
				} else {
					debt[payment.type] += amount
					period_debt[payment.type] += amount
				}

				payments[period_key] = period_debt;

			}

			total_paid += debt.SUBMITTED;
			total_owed += debt.OWED;
			total_forgiven += debt.FORGIVEN; 	
			total_scholarship += debt.SCHOLARSHIP;

			if(student.FamilyID) {
				const existing = total_student_debts[student.FamilyID]
				if(existing) {
					total_student_debts[student.FamilyID] = {
						student,
						debt: {
							OWED: existing.debt.OWED + debt.OWED,
							SUBMITTED: existing.debt.SUBMITTED + debt.SUBMITTED,
							FORGIVEN: existing.debt.FORGIVEN + debt.FORGIVEN,
							SCHOLARSHIP: existing.debt.SCHOLARSHIP + debt.SCHOLARSHIP
						},
						familyId: student.FamilyID
					}
				} else {
					total_student_debts[student.FamilyID] = { student, debt, familyId: student.FamilyID }
				}
			} else {
				total_student_debts[sid] = { student, debt };
			}

			total_debts = { PAID: total_paid, OWED: total_owed, FORGIVEN: total_forgiven, SCHOLARSHIP: total_scholarship }

			this.background_calculation = setTimeout(reducify, 0);

		}

		this.background_calculation = setTimeout(reducify, 0)

	}

	render() {

	// first make sure all students payments have been calculated... (this is for dues)

	// outstanding money
	// who owes it, and how much
	// graph of paid vs due per month.

	const { settings, schoolLogo} = this.props

	const period_format = this.state.selected_period === "Daily" ? "DD/MM/YYYY" : "MM/YYYY"

	const items = Object.values(this.state.total_student_debts)
		.filter(({student, debt}) => (student.id && student.Name) &&
			(this.state.classFilter === "" || student.section_id === this.state.classFilter ) &&
			student.Name.toUpperCase().includes(this.state.filterText.toUpperCase())
		)

	const sections = Object.values(getSectionsFromClasses(this.props.classes))

	return <div className="fees-analytics">

		<PrintHeader 
			settings={settings} 
			logo={schoolLogo}/>

		{ this.state.loading && <div>Calculating...</div> }
		
		<div className="no-print" style={{ marginRight:"10px" }}>
			<div className="divider">Payments over Time</div>

			<div className="btn-filter-toggle row">
				<div className="button green" onClick={ () => this.setState({is_fee_filter: !this.state.is_fee_filter})}>Show Filters</div>
			</div>
			{ this.state.is_fee_filter && <div className="section form">				
				<div className="row">
					<label> Start Date </label>
					<input type="date" 
						   onChange={this.former.handle(["start_date"], () => true, this.onStateChange)} 
						   value={moment(this.state.start_date).format("YYYY-MM-DD")} 
						   max = {moment().format("YYYY-MM-DD")}/>
				</div>
				<div className="row">	
					<label> End Date </label>
					<input type="date" 
						   onChange={this.former.handle(["end_date"], () => true, this.onStateChange)} 
						   value={moment(this.state.end_date).format("YYYY-MM-DD")} 
						   max = {moment().format("YYYY-MM-DD")}/>
				</div>
				
				<div className="row">
					<label> Fee Period </label>
					<select {...this.former.super_handle(["selected_period"], () => true, this.onStateChange)}>
							<option value="Daily">Daily</option>
							<option value="Monthly" selected>Monthly</option>
					</select>
				</div>
			</div>}

			<FeesChart 
				payments={this.state.payments} 
				filter={this.state.chartFilter}
				date_format={period_format}/>
		</div>
		
		<div className="no-print checkbox-container">
			
			<div className="chart-checkbox" style={{ color:"#93d0c5" }}>
				<input
					type="checkbox" 
					{...this.former.super_handle([ "chartFilter", "paid" ])}
				/>
				Paid 
			</div>

			<div className="chart-checkbox" style={{ color:"#939292" }}>
				<input
					type="checkbox"
					{...this.former.super_handle([ "chartFilter", "forgiven" ])}
				/>
				Forgiven
			</div>

			<div className="chart-checkbox" style={{ color:"#ff6b68" }}>
				<input
					type="checkbox"
					{...this.former.super_handle([ "chartFilter", "pending" ])}
				/> 
				Pending
			</div>

			<div className="chart-checkbox" style={{ color:"#74aced" }}>
				<input
					type="checkbox"
					{...this.former.super_handle([ "chartFilter", "total" ])}
				/> 
				Total
			</div>
		
		</div>

		<FeesTable 
			payments={this.state.payments} 
			total_debts={this.state.total_debts}
			date_format={period_format}/>

		<div className="divider">Students with Payments Outstanding</div>
		<div className="section">
		
		<div className="no-print row">
			<input
				className="search-bar"
				type="text"
				{...this.former.super_handle(["filterText"])}
				placeholder = "search"
			/>
			<select {...this.former.super_handle(["classFilter"])}>
				<option value=""> Select Class </option>
				{
					sections
						.map(s => {
							return <option value={s.id} key={s.id}> {s.namespaced_name}</option>
						})
				}
			</select>
		</div>
		<div className="table row">
				<label><b>Name</b></label>
				<label><b>Phone</b></label>
				<label><b>Amount</b></label>
		</div>
		{
			items
			.filter(({ student, debt }) => (student.tags === undefined ) || (!student.tags["PROSPECTIVE"]))
			.sort((a, b) => this.calculateDebt(a.debt) - this.calculateDebt(b.debt))
			.map(({ student, debt, familyId }) => <div className="table row" key={student.id}>
					<Link to={`/student/${student.id}/payment`}>{ familyId ? familyId : student.Name}</Link>
					<div>{ student.Phone }</div>
					<div  style={ this.calculateDebt(debt) >= 1 ? {color:"#5ecdb9"} : {color:"#fc6171" } } > {numberWithCommas(-1 * this.calculateDebt(debt))}</div>
				</div>)
		}
		<div className="print button" onClick={() => window.print()} style={{ marginTop: "10px" }}>Print</div>
		</div>

	</div>
  }
}
export default connect((state: RootReducerState) => ({
	students: state.db.students,
	settings: state.db.settings,
	classes: state.db.classes,
	schoolLogo: state.db.assets ? state.db.assets.schoolLogo || "" : "" 
}), (dispatch: Function) => ({
	addPayments: (payments: PaymentAddItem[]) => dispatch(addMultiplePayments(payments))
}))(FeeAnalytics)
