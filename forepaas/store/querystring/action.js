
import FpSdk from 'forepaas/sdk'
import memoryActions from '../memory/action'
import {createBrowserHistory} from 'history'
const history = createBrowserHistory()

let cache = {}

history.listen(location => FpSdk.modules.store.dispatch(memoryActions.set('fp-application-route', location)))

function push (withPush) {
  var qs = []
  for (let key in cache) {
    if (cache[key]) { qs.push(key + '=' + JSON.stringify(cache[key])) }
  }
  qs = qs.join('&')
  history.push({
    pathname: window.location.pathname,
    hash: window.location.hash.split('?')[0] + '?' + qs
  })
}

function pull () {
  let search = window.location.hash.split('?')[1] || ''
  let qs = search.split('&').map((param) => {
    return param.split('=')
  })
  cache = {}
  qs.forEach((param) => {
    try {
      if (param.length === 2) { cache[param[0]] = JSON.parse(decodeURI(param[1])) }
    } catch (err) {
      if (param.length === 2) cache[param[0]] = decodeURI(param[1])
    }
  })
  FpSdk.Utils.getAllFromKey('dynamic-parameter', 'dynamic-parameter.id')
    .forEach((id) => {
      if (typeof cache[id] === 'undefined') {
        cache[id] = null
      }
    })
}

function set (key, value, withoutPush) {
  cache[key] = value
  if (!withoutPush) push()
  return {
    type: 'FP_SET_QUERYSTRING_STORE',
    payload: {
      key: key,
      value: value
    }
  }
}

function del (key) {
  delete cache[key]
  push()
  return {
    type: 'FP_DELETE_QUERYSTRING_STORE_KEY',
    payload: {
      key: key
    }
  }
}

function reset () {
  history.push({
    pathname: window.location.pathname + window.location.hash.split('?')[0],
    search: ''
  })
  return dispatch => {
    Object.keys(cache).forEach((key) => dispatch(del(key)))
  }
}

function initAll () {
  return dispatch => {
    pull()
    Object.keys(cache).forEach((key) => {
      dispatch(set(key, cache[key], true))
    })
  }
}

export { set, del, initAll, reset }

export default {
  set,
  del,
  initAll,
  reset
}
