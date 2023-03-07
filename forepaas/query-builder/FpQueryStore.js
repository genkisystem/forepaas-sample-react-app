import FpApi from 'forepaas/api'
import FpSdk from 'forepaas/sdk'
import QueryDictionary from './FpQueryDictionary'

class FpQueryStore {
  constructor (queryId) {
    this.type = 'FpQueryStore'
    this.id = queryId
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
    if (typeof cache === 'undefined') { cache = this.cache }
    return FpApi.post({
      cache: cache,
      url: '/qb/query/' + this.id,
      data: {
        dynamic_parameters: this.dynamic_parameters
      },
      queryString: {
        id: (FpSdk.config.debug === true) ? this.id : undefined
      }
    }).then((response) => {
      let dictionaries = (response.query_params.dictionaries || []).map(dict => new QueryDictionary(dict))
      return Promise.all(dictionaries.map(dict => dict.compute(response)))
        .then(_ => {
          return response
        })
    })
  }
}

export default FpQueryStore
