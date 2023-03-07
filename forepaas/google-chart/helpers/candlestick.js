import FpSdk from 'forepaas/sdk'

import FpGoogleChart from '../FpGoogleChart.jsx'

let candlestickOptions = {
  type: 'CandlestickChart'
}

class FpGoogleChartCandlestick extends FpGoogleChart {
  constructor (props) {
    super(props)
    FpSdk.Utils.merge(this.options, candlestickOptions)
  }
}

export default FpGoogleChartCandlestick
