import FpSdk from 'forepaas/sdk'

import FpGoogleChart from '../FpGoogleChart.jsx'

let pieOptions = {
  type: 'PieChart'
}

class FpGoogleChartPie extends FpGoogleChart {
  constructor (props) {
    super(props)
    FpSdk.Utils.merge(this.options, pieOptions)
  }
}

export default FpGoogleChartPie
