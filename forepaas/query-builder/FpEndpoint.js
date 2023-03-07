import FpApi from 'forepaas/api'
import QueryDictionary from './FpQueryDictionary'

class FpEndpoint {
  constructor (endpoint) {
    endpoint.params = endpoint.params || {}
    Object.keys(endpoint.params).forEach(key => {
      this[key] = endpoint.params[key]
    })
    this.query = endpoint.query
    this.queryString = endpoint.queryString
    this.id = endpoint.id
    this.method = endpoint.method
    this.dictionaries = (endpoint.params.dictionaries || []).map(dict => new QueryDictionary(dict))
    this.type = 'FpEndpoint'
    this.cache = endpoint.cache

    this.data = endpoint.params.data
    this.scale = endpoint.params.scale
    this.filter = endpoint.params.filter
    this.evol = endpoint.params.evol
    this.order = endpoint.params.order
    this.total = endpoint.params.total
    this.table_name = endpoint.table_name
    this.database_name = endpoint.database_name
    this.dynamic_parameters = []
    return this
  }

  addDynamicParameter (config, value) {
    let dynP = {
      type: config.type,
      transform: config.transform,
      value: value,
      params: config.params
    }
    Object.assign(dynP, config.meta)
    this.dynamic_parameters.push(dynP)
  }

  compute (options, cache) {
    if (typeof (this.cache) === 'undefined') {
      cache = this.cache
    }

    options = options || {}
    let method = (this.method && this.method.toLowerCase()) || 'post'
    return FpApi[method]({
      cache: cache,
      url: this.query || '',
      queryString: this.queryString,
      data: this
    })
      .then((response) => {
        return Promise.all(this.dictionaries.map(dict => dict.compute(response)))
          .then(_ => {
            return response
          })
      })
  }
}

export default FpEndpoint
