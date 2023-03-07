import FpChartHtml from './charts/html'
import FpSdk from 'forepaas/sdk'
import FpChart from './FpChart.jsx'

FpSdk.modules['chart-html'] = FpChartHtml

export default FpChart
