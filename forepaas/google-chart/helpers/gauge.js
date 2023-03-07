import FpSdk from 'forepaas/sdk'

import FpGoogleChart from '../FpGoogleChart.jsx'

let gaugeOptions = {
  type: 'Gauge'
}

class FpGoogleChartGauge extends FpGoogleChart {
  constructor (props) {
    super(props)
    FpSdk.Utils.merge(this.options, gaugeOptions)
  }
}

export default FpGoogleChartGauge
