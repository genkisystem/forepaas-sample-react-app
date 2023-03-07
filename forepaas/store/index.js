import { applyMiddleware, createStore, combineReducers } from 'redux'
import thunk from 'redux-thunk'

import subscribeKey from './subscribeKey'
import local from './local'
import memory from './memory'
import querystring from './querystring'
import session from './session'

let middleware = [thunk]
if (process.env.NODE_ENV !== 'production') {
  const {createLogger} = require('redux-logger')
  middleware.push(createLogger({
    collapsed: true
  }))
}

let reducers = {
  local: local.reducers,
  memory: memory.reducers,
  querystring: querystring.reducers,
  session: session.reducers
}

const storeReducers = combineReducers(reducers)

let store = createStore(storeReducers, applyMiddleware(...middleware))
store.subscribeKey = subscribeKey(store)
store.actions = {
  local: local.actions,
  memory: memory.actions,
  querystring: querystring.actions,
  session: session.actions
}

export default store
