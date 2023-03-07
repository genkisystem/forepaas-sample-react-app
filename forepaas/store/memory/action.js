function set () {
  let value = arguments[arguments.length - 1]
  let key = arguments[arguments.length - 2]
  return {
    type: 'FP_SET_MEMORY_STORE',
    payload: {
      key: key,
      value: value
    }
  }
}

function del () {
  let key = arguments[arguments.length - 1]
  return {
    type: 'FP_DELETE_MEMORY_STORE_KEY',
    payload: {
      key: key
    }
  }
}

export { set, del }

export default {
  set,
  del
}
