import FpSdk from 'forepaas/sdk'

import FpGoogleChart from '../FpGoogleChart.jsx'

let histogramOptions = {
  type: 'Histogram'
}

class FpGoogleChartHistogram extends FpGoogleChart {
  constructor (props) {
    super(props)
    FpSdk.Utils.merge(this.options, histogramOptions)
  }
}

export default FpGoogleChartHistogram
