import FpSdk from 'forepaas/sdk'

import FpGoogleChart from '../FpGoogleChart.jsx'

let scatterOptions = {
  type: 'ScatterChart'
}

class FpGoogleChartScatter extends FpGoogleChart {
  constructor (props) {
    super(props)
    FpSdk.Utils.merge(this.options, scatterOptions)
  }
}

export default FpGoogleChartScatter
