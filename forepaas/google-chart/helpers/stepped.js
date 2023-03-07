import FpSdk from 'forepaas/sdk'

import FpGoogleChart from '../FpGoogleChart.jsx'

let steppedOptions = {
  type: 'SteppedAreaChart'
}

class FpGoogleChartStepped extends FpGoogleChart {
  constructor (props) {
    super(props)
    FpSdk.Utils.merge(this.options, steppedOptions)
  }
}

export default FpGoogleChartStepped
