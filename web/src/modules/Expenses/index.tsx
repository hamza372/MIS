import React, { Component } from 'react'
import Layout from '../../components/Layout/index'
import { RouteComponentProps } from 'react-router';
import Former from '../../utils/former';

import './style.css'
import { connect } from 'react-redux';

interface P {

}

interface S {

}

interface Routeinfo {
    id: string
}

type propTypes = RouteComponentProps<Routeinfo> & P

class Expenses extends Component <propTypes, S> {
    
    former: Former
    constructor(props: propTypes) {
    super(props)

    this.state = {
        
    }

    this.former = new Former (this,[])
    }

  render() {
    return (
      <Layout history={this.props.history}>
         <div className="expenses">
            <div className="title"> Expenses </div>

            <div className="table section">
              <div className="row header">
                <label>Date</label>
                <label> Label</label>
                <label> Type</label>
                <label> Amount</label>
              </div>
            </div>
         </div>
      </Layout>
    )
  }
}

export default connect ( (state: RootReducerState) => ({

}))(Expenses)
