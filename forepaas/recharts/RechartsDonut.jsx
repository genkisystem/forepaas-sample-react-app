import RechartsPie from './RechartsPie.jsx'

export default class RechartsDonut extends RechartsPie {
  generateDecoration (state) {
    super.generateDecoration(state)
    state.series.forEach(serie => {
      serie.innerRadius = serie.innerRadius || 50
      serie.outerRadius = serie.outerRadius || 60
    })
  }
}
