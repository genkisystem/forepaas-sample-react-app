import get from 'lodash/get'

import FpSdk from 'forepaas/sdk'
import FpTranslate from 'forepaas/translate'

function Axis (options, ...items) {
  var axis = new Array(...items)
  axis.options = options
  Object.setPrototypeOf(axis, Axis.prototype)
  return axis
}

Axis.prototype.isTemporal = function () {
  if (this.options.disableTemporal) { return false }
  for (var scale of Array.from(this)) {
    if (get(FpSdk.config, `formatter.dimensions.${scale}.type`) !== 'temporal') {
      return false
    }
  }
  return true
}

Axis.prototype.setToDate = function (date, scale, value) {
  let v
  switch (get(FpSdk.config, `formatter.dimensions.${scale}.subtype`)) {
    case 'year':
      date.setUTCFullYear(parseInt(value))
      break
    case 'month-year':
      if (value) {
        v = value.split('-')
        date.setFullYear(parseInt(v[0]))
        date.setMonth(parseInt(v[1]) - 1)
      }
      break
    case 'month':
      date.setUTCMonth(parseInt(value) - 1)
      break
    case 'date':
      if (value) {
        v = value.split('-')
        date.setFullYear(parseInt(v[0]))
        date.setMonth(parseInt(v[1]) - 1)
        date.setDate(parseInt(v[2]))
      }
      break
  }
  return date
}

Axis.prototype.format = function (values) {
  let scale
  if (this.isTemporal()) {
    const date = new Date(1970, 0, 1, 0, 0, 0)
    for (scale of Array.from(this)) {
      const val = values[scale]
      this.setToDate(date, scale, val)
    }
    return date
  }
  let axisValue = ''
  for (scale of Array.from(this)) {
    if (axisValue) { axisValue += ' ' }
    axisValue += FpTranslate(scale + '-' + values[scale], {default: values[scale]})
  }
  return axisValue
}

export default Axis
