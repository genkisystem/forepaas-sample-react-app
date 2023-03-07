import FpMeasure from './FpMeasure'

class FpEvol {
  constructor (data) {
    this.data = data
    this.measure = new FpMeasure(data + '_evolution')
  }

  setPast (past) {
    this.past = past
    return this
  }

  setNow (now) {
    this.now = now
    return this
  }

  valueOf () {
    this.past = this.past || 0
    this.now = this.now || 0
    if (!this.past) return 1
    if (!this.now) return -1
    let value = (this.now - this.past) / Math.abs(this.past)
    return value
  }

  toString () {
    this.measure.setValue(this.valueOf() * 100)
    if (this.value >= 0) { return '+' + this.measure.toString() }
    return this.measure.toString()
  }
}

export default FpEvol
