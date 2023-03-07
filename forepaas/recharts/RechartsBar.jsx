import Recharts from './Recharts.jsx'

export default class RechartsBar extends Recharts {
  generateDecoration (state) {
    super.generateDecoration(state)
    state.series.forEach(serie => {
      serie._type = 'bar'
      serie.stroke = serie.stroke || serie.fill
    })
  }
}
