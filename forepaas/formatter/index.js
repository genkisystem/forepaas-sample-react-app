import FpMeasure from './FpMeasure'
import FpEvol from './FpEvol'
import FpDimensions from './FpDimensions'
import FpDimension from './FpDimension'

class FpFormatter {
  constructor () {
    this.FpMeasure = FpMeasure
    this.FpEvol = FpEvol
    this.FpDimensions = FpDimensions
    this.FpDimension = FpDimension
    return this
  }
}

export { FpMeasure, FpEvol, FpDimension, FpDimensions }

export default new FpFormatter()
