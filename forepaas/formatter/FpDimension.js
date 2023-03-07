import FpSdk from 'forepaas/sdk'
import moment from 'moment-timezone'


const initTimeZone = () => {
  if (
    FpSdk.config.timezone &&
    moment.tz.zone(FpSdk.config.timezone) &&
    moment().tz() !== FpSdk.config.timezone
  ) {
    moment.tz.setDefault(FpSdk.config.timezone)
  }
}

var FpDimension = function (dimension) {
  var inst = new String(dimension) // eslint-disable-line no-new-wrappers
  inst.__proto__ = FpDimension.prototype // eslint-disable-line no-proto
  initTimeZone()
  FpSdk.config.formatter = FpSdk.config.formatter || {}
  FpSdk.config.formatter.dimensions = FpSdk.config.formatter.dimensions || {}
  inst.info = FpSdk.config.formatter.dimensions[inst] || {}
  return inst
}
FpDimension.prototype = Object.create(String.prototype)
FpDimension.prototype.isTemporal = function () {
  try {
    return this.info.type === 'temporal'
  } catch (e) {}
  return false
}
FpDimension.prototype.setToDate = function (date, value) {
  if (!this.isTemporal) {
    throw new Error(this + ' is not a temporal scale.')
  }
  if (!value) return 0
  switch (this.info.subtype) {
    case 'year':
      date.year(value)
      break
    case 'month':
      date.month(value - 1)
      break
    case 'quarter':
      date.month((value - 1) * 3)
      break
    case 'semester':
      date.month((value - 1) * 6)
      break
    case 'date':
      value = value || ''
      var v = value.split(' ')[0].split('-')
      date.year(v[0]).month(parseInt(v[1]) - 1).date(v[2]).hour(0)
      break
    case 'datetime':
      value = value || ''
      let days = value.split(' ')[0].split('-')
      let hours = value.split(' ')[1].split(':')
      date.year(days[0]).month(parseInt(days[1]) - 1).date(days[2]).hour(hours[0]).minute(hours[1]).second(hours[2])
      break
    case 'month-year':
      value = value || ''
      v = value.split('-')
      date.year(v[0]).month(parseInt(v[1]) - 1).date(1).hour(0)
      break
    case 'week-year':
      value = value || ''
      v = value.split('-')
      date.year(v[0]).isoWeek(v[1])
      break
    default:
      // If you choose to use a custom formatter, you can't add 2 of them in the same request, cause the second will erase the first one
      if (!this.info.format && !this.info.source_format) {
        throw new Error(`No default parser for '${this.info.subtype}, you need to add 'format' property in the formatter definition`)
      }
      date = moment(value, this.info.source_format || this.info.format)
  }
  return date
}
FpDimension.prototype.getTimeFormat = function () {
  var defaults = {
    year: 'YYYY',
    month: 'MMM',
    quarter: '[Q]Q'
  }
  return this.info.display_format || this.info.format || defaults[this.info.subtype]
}
FpDimension.prototype.formatFromScale = function (scaleValue) {
  if (this.isTemporal() && scaleValue) {
    let date = this.setToDate(moment(0), scaleValue)
    return date.format(this.getTimeFormat())
  }
  return scaleValue
}
FpDimension.prototype.formatFromTimestamp = function (value) {
  return moment(value).format(this.getTimeFormat())
}

export default FpDimension
