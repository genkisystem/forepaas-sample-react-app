import FpSdk from 'forepaas/sdk'

import FpGoogleChart from '../FpGoogleChart.jsx'

let donutOptions = {
  type: 'DonutChart'
}

class FpGoogleChartDonut extends FpGoogleChart {
  constructor (props) {
    super(props)
    FpSdk.Utils.merge(this.options, donutOptions)
  }
}

export default FpGoogleChartDonut
