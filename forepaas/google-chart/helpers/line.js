import FpSdk from 'forepaas/sdk'

import FpGoogleChart from '../FpGoogleChart.jsx'

let lineOptions = {
  type: 'LineChart'
}

class FpGoogleChartLine extends FpGoogleChart {
  constructor (props) {
    super(props)
    FpSdk.Utils.merge(this.options, lineOptions)
  }
}

export default FpGoogleChartLine
