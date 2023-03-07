import FpSdk from 'forepaas/sdk'
import FpTranslate from 'forepaas/translate'
import moment from 'moment-timezone'
import FpDimension from './FpDimension'


const initTimeZone = () => {
  if (
    FpSdk.config.timezone &&
    moment.tz.zone(FpSdk.config.timezone) &&
    moment().tz() !== FpSdk.config.timezone
  ) {
    moment.tz.setDefault(FpSdk.config.timezone)
  }
}

var FpDimensions = function (dimensions) {
  var inst = new Array() // eslint-disable-line no-array-constructor
  inst.__proto__ = FpDimensions.prototype // eslint-disable-line no-proto
  initTimeZone()
  if (!Array.isArray(dimensions)) dimensions = []
  Object.assign(inst, dimensions.map((dimension) => {
    return new FpDimension(dimension)
  }))
  return inst
}
FpDimensions.prototype = Object.create(Array.prototype)
FpDimensions.prototype.getDate = function (scales) {
  let date = moment(0)
  this.forEach((dimension) => {
    date = dimension.setToDate(date, scales[dimension])
  })
  return new Date(date.valueOf())
}
FpDimensions.prototype.isTemporal = function () {
  return !this.filter((dimension) => !dimension.isTemporal()).length
}

FpDimensions.prototype.format = function (result) {
  if (this.isTemporal()) {
    return this.getDate(result.scales)
  }
  let label = ''
  for (let key in result.scales) {
    let value = result.scales[key]
    if (label) label += ' '
    label += FpTranslate(key + '-' + value, {
      default: value
    })
  }
  return label
}

FpDimensions.prototype.formatFromTimestamp = function (value) {
  let ret = []
  let tmp = this.map(elem => elem.formatFromTimestamp(value))
  tmp.forEach(elem => {
    if (ret.indexOf(elem) === -1) {
      ret.push(elem)
    }
  })
  return ret.join(' ')
}

export default FpDimensions
