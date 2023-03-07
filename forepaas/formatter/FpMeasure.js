import cloneDeep from 'lodash/cloneDeep'

import FpSdk from 'forepaas/sdk'
import FpTranslate from 'forepaas/translate'

class FpMeasure {
  constructor (data) {
    FpSdk.config.formatter.separator = FpSdk.config.formatter.separator || {}
    FpSdk.config.formatter.separator.decimal = FpSdk.config.formatter.separator.decimal || '.'
    FpSdk.config.formatter.separator.thousand = FpSdk.config.formatter.separator.thousand || ','
    FpSdk.config.formatter.measures = FpSdk.config.formatter.measures || {}
    this.data = data
    this.generateMeta(data)
  }

  generateMeta (data) {
    var meta
    if (typeof (data) === 'string') {
      FpSdk.config.formatter.measures[data] = FpSdk.config.formatter.measures[data] || {}
      meta = cloneDeep(FpSdk.config.formatter.measures[data]) || {}
    } else {
      meta = data || {}
    }
    meta.unit = meta.unit || ''
    meta.mult = meta.mult || 1
    this.meta = meta
  }

  setValue (value) {
    this.value = value
    return this
  }

  unit (value) {
    if (!value && value !== 0) return value
    return value + this.meta.unit
  }

  round (value) {
    if (value && typeof (this.meta.round) !== 'undefined') return Math.round(value * Math.pow(10, this.meta.round)) / Math.pow(10, this.meta.round)
    return value
  }

  mult (value) {
    if (value) { return value * this.meta.mult }
    return value
  }

  recursivePows (value, pows, intLength) {
    let pow = pows.shift()
    if (intLength > this.meta.short && pows.length) {
      value /= 1000
      return this.recursivePows(value, pows, parseInt(value).toString().length)
    }
    return this.round(value) + pow
  }

  pows (value) {
    if (!this.meta.pows || !value || !this.meta.short || parseInt(value).toString().length < this.meta.short) { return value }
    return this.recursivePows(value, cloneDeep(this.meta.pows), parseInt(value).toString().length)
  }

  valueOf () {
    return this.value
  }

  beautify (value) {
    if (value) {
      let stringPart = ''
      for (var i = value.length - 1; i > 0; i--) {
        if (!isNaN(value[i])) break
        stringPart += value[i]
        value = value.slice(0, -1)
      }
      let decimalPart = value.toString().split('.')[1]
      let integerPart = value.toString().split('.')[0].replace(/\B(?=(\d{3})+(?!\d))/g, FpSdk.config.formatter.separator.thousand)
      if (!decimalPart) return integerPart + stringPart
      return integerPart + FpSdk.config.formatter.separator.decimal + decimalPart + stringPart
    }
    if (isNaN(value)) return this.value
    return value
  }

  toString () {
    return this.unit(this.beautify(this.pows(this.round(this.mult(this.value)))))
  }

  static getEvol (key, type, data) {
    let ret = []
    let types = {
      year: 'n',
      month: 'm',
      week: 'w',
      day: 'd',
      hour: 'h'
    }
    data.forEach((d, idx) => {
      let name = `${FpTranslate(key)}${idx > 0 ? ` (${types[type]}-${idx})` : ''}`
      ret.push({ name: name, value: new FpMeasure(key).setValue(d.value).toString() })
      if (idx > 0) {
        let measure = new FpMeasure(key + '_evolution')
        let past = d.value
        let now = data[idx - 1].value
        let value
        if (!past) value = 1
        else if (!now) value = -1
        else value = (now - past) / Math.abs(past)
        measure.setValue(value * 100)
        ret[ret.length - 1].evol_value = value
        ret[ret.length - 1].evol = `${value > 0 ? '+' : ''}${measure.toString()}`
      }
    })
    return ret
  }
}

export default FpMeasure
