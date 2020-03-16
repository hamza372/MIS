import React, { useState } from 'react'
import { RouteComponentProps } from 'react-router'
import Layout from 'components/Layout'
import DefaultFeeSettings from './DefaultFee'
import VoucherSettings from './Voucher'

import './style.css'

type propsType = RouteComponentProps

const DEFAULT_FEE = "DEFAULT_FEE"
const VOUCHER_SETTINGS = "VOUCHER_SETTINGS"

const ClassSettings = (props: propsType) => {

    const [forwardTo, setForwardTo] = useState(DEFAULT_FEE)

    return <Layout history={props.history}>
        <div className="class-settings">
            <div className="row tags" style={{ marginTop: 10 }}>
                <div className={`button ${forwardTo === DEFAULT_FEE ? 'blue' : 'grey'}`} onClick={() => setForwardTo(DEFAULT_FEE)}>Default Fee</div>
                <div className={`button ${forwardTo === VOUCHER_SETTINGS ? 'blue' : 'grey'}`} onClick={() => setForwardTo(VOUCHER_SETTINGS)}>Fee Voucher</div>
            </div>
            {
                forwardTo === DEFAULT_FEE && <DefaultFeeSettings />
            }
            {
                forwardTo === VOUCHER_SETTINGS && <VoucherSettings />
            }
        </div>
    </Layout>
}
export default ClassSettings