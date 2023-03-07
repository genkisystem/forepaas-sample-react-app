import has from 'lodash/has'
import get from 'lodash/get'
import FpSdk from 'forepaas/sdk'

class Utils {
  static mergeKey (obj, key, value) {
    var final, i, results
    if (typeof value !== 'object') {
      obj[key] = value
      return
    }
    if (Array.isArray(obj[key]) && !Array.isArray(value)) {
      results = []
      for (i in obj[key]) {
        results.push(obj[key][i] = Object.assign({}, obj[key][i], value))
      }
      return results
    } else if (!Array.isArray(obj[key]) && Array.isArray(value)) {
      final = []
      for (i in value) {
        final.push(Object.assign({}, obj[key], value[i]))
      }
      obj[key] = final
    } else {
      return Object.assign(obj[key], value)
    }
  }

  static merge (obj, options) {
    var key
    for (key in options) {
      if (obj[key] && options[key]) {
        Utils.mergeKey(obj, key, options[key])
      } else {
        obj[key] = options[key]
      }
    }
  }

  static offset (el) {
    var rect = el.getBoundingClientRect()
    var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop
    return {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft,
      right: rect.right + scrollLeft,
      bottom: rect.bottom + scrollTop,
      height: rect.height,
      width: rect.width,
      x: rect.x,
      y: rect.y
    }
  }

  static getAllFromKey (type, getKey) {
    let ignoredKeys = ['server']
    const getAllFromKeyFunc = (type, getKey, obj, arr) => {
      if (typeof obj !== 'undefined' && obj !== null) {
        Object.keys(obj).forEach((key) => {
          if (obj[key] && typeof obj[key] === 'object' && ignoredKeys.indexOf(key) === -1) {
            if (obj[key].type === type) {
              if (getKey && has(obj[key], getKey)) {
                arr.push(get(obj[key], getKey))
              } else {
                arr.push(obj[key])
              }
            }
            return getAllFromKeyFunc(type, getKey, obj[key], arr)
          }
        })
      }
      return arr
    }
    return getAllFromKeyFunc(type, getKey, FpSdk.config, [])
  }
}

export default Utils
