import FpSdk from 'forepaas/sdk'

import FpGoogleChart from '../FpGoogleChart.jsx'

let areaOptions = {
  type: 'AreaChart'
}

class FpGoogleChartArea extends FpGoogleChart {
  constructor (props) {
    super(props)
    FpSdk.Utils.merge(this.options, areaOptions)
  }
}

export default FpGoogleChartArea
