export default function reducer (state = {
}, action) {
  switch (action.type) {
    case 'FP_SET_QUERYSTRING_STORE': {
      return Object.assign({}, state, { [action.payload.key]: action.payload.value })
    }
    case 'FP_DELETE_QUERYSTRING_STORE_KEY': {
      let copyState = Object.assign({}, state)
      delete copyState[action.payload.key]
      return copyState
    }
    default: {
      return state
    }
  }
}
