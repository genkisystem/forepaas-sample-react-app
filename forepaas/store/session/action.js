function set () {
  let value
  try {
    value = JSON.stringify(arguments[arguments.length - 1])
  } catch (err) {
    value = arguments[arguments.length - 1]
  }
  let key = arguments[arguments.length - 2]
  sessionStorage.setItem(key, value)
  return {
    type: 'FP_SET_SESSION_STORE',
    payload: {
      key: key,
      value: value
    }
  }
}

function del () {
  let key = arguments[arguments.length - 1]
  sessionStorage.removeItem(key)
  return {
    type: 'FP_DELETE_SESSION_STORE_KEY',
    payload: {
      key: key
    }
  }
}

function initAll () {
  return dispatch => {
    Object.keys(sessionStorage).forEach((key) => {
      let value
      try {
        value = JSON.parse(sessionStorage.getItem(key))
      } catch (err) {
        value = sessionStorage.getItem(key)
      }
      dispatch(set(key, value))
    })
  }
}

export { set, del, initAll }

export default {
  set,
  del,
  initAll
}
