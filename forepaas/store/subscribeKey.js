import isEqual from 'lodash/isEqual'
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'

let currentValues = {}

let watch = (getState, objectPath) => {
  let randomId = Math.floor((Math.random() * 1000000) + 1).toString()
  return (fn) => {
    return function () {
      let path = `${objectPath}-${randomId}`
      let newValue = get(getState(), objectPath)
      if (!isEqual(currentValues[path], newValue)) {
        var oldValue = currentValues[path]
        currentValues[path] = cloneDeep(newValue)
        fn(newValue, oldValue, objectPath)
      }
    }
  }
}

export default (store) => {
  return (key, callback) => {
    let w = watch(store.getState, key)
    return store.subscribe(w(callback))
  }
}
