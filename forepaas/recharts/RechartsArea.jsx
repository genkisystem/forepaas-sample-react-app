import Recharts from './Recharts.jsx'

export default class RechartsArea extends Recharts {
  generateDecoration (state) {
    super.generateDecoration(state)
    state.series.forEach(serie => {
      serie._type = 'area'
      serie.stroke = serie.fill
    })
  }
}
