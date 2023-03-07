import FpSdk from 'forepaas/sdk'
import FpGoogleChart from '../FpGoogleChart.jsx'

let columnOptions = {
  type: 'ColumnChart'
}

class FpGoogleChartColumn extends FpGoogleChart {
  constructor (props) {
    super(props)
    FpSdk.Utils.merge(this.options, columnOptions)
  }
}

export default FpGoogleChartColumn
