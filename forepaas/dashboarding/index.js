import FpDashboardLoader from './FpDashboardLoader.jsx'
import Templates from './templates.js'

class FpDashboard {
  constructor () {
    this.FpDashboardLoader = FpDashboardLoader
    this.templates = Templates
  }
}
export default new FpDashboard()
