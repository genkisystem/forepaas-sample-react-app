import FpGoogleChart from './FpGoogleChart.jsx'
import FpGoogleChartLine from './helpers/line'
import FpGoogleChartArea from './helpers/area'
import FpGoogleChartPie from './helpers/pie'
import FpGoogleChartColumn from './helpers/column'
import FpGoogleChartBar from './helpers/bar'
import FpGoogleChartCandlestick from './helpers/candlestick'
import FpGoogleChartDonut from './helpers/donut'
import FpGoogleChartGauge from './helpers/gauge'
import FpGoogleChartScatter from './helpers/scatter'
import FpGoogleChartStepped from './helpers/stepped'
import FpGoogleChartHistogram from './helpers/histogram'

export default {
  default: FpGoogleChart,
  line: FpGoogleChartLine,
  area: FpGoogleChartArea,
  pie: FpGoogleChartPie,
  column: FpGoogleChartColumn,
  bar: FpGoogleChartBar,
  candlestick: FpGoogleChartCandlestick,
  donut: FpGoogleChartDonut,
  gauge: FpGoogleChartGauge,
  scatter: FpGoogleChartScatter,
  stepped: FpGoogleChartStepped,
  histogram: FpGoogleChartHistogram,
  listAll: require.context('./helpers', true, /\.js$/).keys()
}
