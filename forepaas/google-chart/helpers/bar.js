import FpSdk from 'forepaas/sdk'

import FpGoogleChart from '../FpGoogleChart.jsx'

let barOptions = {
  type: 'BarChart'
}

class FpGoogleChartBar extends FpGoogleChart {
  constructor (props) {
    super(props)
    FpSdk.Utils.merge(this.options, barOptions)
  }
}

export default FpGoogleChartBar
