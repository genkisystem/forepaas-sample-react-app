function set () {
  let value
  try {
    value = JSON.stringify(arguments[arguments.length - 1])
  } catch (err) {
    value = arguments[arguments.length - 1]
  }
  let key = arguments[arguments.length - 2]
  localStorage.setItem(key, value)
  return {
    type: 'FP_SET_LOCAL_STORE',
    payload: {
      key: key,
      value: value
    }
  }
}

function del () {
  let key = arguments[arguments.length - 1]
  localStorage.removeItem(key)
  return {
    type: 'FP_DELETE_LOCAL_STORE_KEY',
    payload: {
      key: key
    }
  }
}

function initAll () {
  return dispatch => {
    Object.keys(localStorage).forEach((key) => {
      let value
      try {
        value = JSON.parse(localStorage.getItem(key))
      } catch (err) {
        value = localStorage.getItem(key)
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
