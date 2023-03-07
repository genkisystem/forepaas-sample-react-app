import Recharts from './Recharts.jsx'
import RechartsPie from './RechartsPie.jsx'
import RechartsLine from './RechartsLine.jsx'
import RechartsArea from './RechartsArea.jsx'
import RechartsAreaPercent from './RechartsAreaPercent.jsx'
import RechartsBar from './RechartsBar.jsx'
import RechartsBarHorizontal from './RechartsBarHorizontal.jsx'
import RechartsBarPercent from './RechartsBarPercent.jsx'
import RechartsDonut from './RechartsDonut.jsx'
import RechartsScatter from './RechartsScatter.jsx'

export default {
  default: Recharts,
  pie: RechartsPie,
  line: RechartsLine,
  area: RechartsArea,
  'area-percent': RechartsAreaPercent,
  bar: RechartsBar,
  'bar-percent': RechartsBarPercent,
  'bar-horizontal': RechartsBarHorizontal,
  donut: RechartsDonut,
  scatter: RechartsScatter
};
